import { ref, type Ref, onMounted, onUnmounted } from 'vue'
import type { useCanvasStore } from '@/stores/canvasStore'
import type { KonvaEventObject } from 'konva/lib/Node'

/**
 * Canvas 交互功能 Composable
 * 封装画布的拖拽、缩放、鼠标位置追踪等交互功能
 */
export function useCanvasInteraction(
  stageRef: Ref<any>,
  canvasStore: ReturnType<typeof useCanvasStore>
) {
  // 拖动状态
  const isPanning = ref(false)
  const lastPointerPosition = ref({ x: 0, y: 0 })
  const mouseDownPosition = ref({ x: 0, y: 0 })
  const hasMoved = ref(false) // 是否真正移动过

  // 鼠标位置（笛卡尔坐标）
  const mousePosition = ref({ x: 0, y: 0 })

  // 拖拽阈值（像素），超过这个距离才算拖拽
  const DRAG_THRESHOLD = 5

  /**
   * 鼠标滚轮缩放
   * 实现以鼠标为中心的缩放效果
   */
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()

    const stage = stageRef.value?.getStage()
    if (!stage) return

    const oldScale = canvasStore.viewport.scale
    const pointer = stage.getPointerPosition()

    // 计算鼠标在画布中的笛卡尔坐标（缩放前）
    const mouseX = (pointer.x - canvasStore.viewport.x) / oldScale
    const mouseY = -(pointer.y - canvasStore.viewport.y) / oldScale

    // 计算新的缩放比例
    const scaleBy = 1.1
    const newScale =
      e.evt.deltaY < 0 ? Math.min(oldScale * scaleBy, 10) : Math.max(oldScale / scaleBy, 0.001)

    // 计算新的视口位置（保持鼠标指向的画布位置不变）
    const newViewportX = pointer.x - mouseX * newScale
    const newViewportY = pointer.y + mouseY * newScale

    canvasStore.setViewport({
      scale: newScale,
      x: newViewportX,
      y: newViewportY,
    })
  }

  /**
   * 鼠标按下（开始拖动画布）
   */
  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    // 鼠标左键+ctrl键 可以拖动画布
    if (e.evt.button === 0 && e.evt.ctrlKey) {
      const stage = stageRef.value?.getStage()
      if (!stage) return

      const pointer = stage.getPointerPosition()
      isPanning.value = true
      hasMoved.value = false
      lastPointerPosition.value = pointer
      mouseDownPosition.value = pointer
    }
  }

  /**
   * 鼠标移动（拖动画布 + 更新鼠标位置）
   */
  const handleMouseMove = (_e: KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.value?.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    // 更新鼠标位置（转换为笛卡尔坐标）
    // 屏幕坐标 → 笛卡尔坐标：x 不变，y 需要翻转
    const scale = canvasStore.viewport.scale
    const canvasX = (pointer.x - canvasStore.viewport.x) / scale
    const canvasY = -(pointer.y - canvasStore.viewport.y) / scale
    mousePosition.value = { x: canvasX, y: canvasY }

    // 拖动画布
    if (!isPanning.value) return

    // 检查是否超过拖拽阈值
    if (!hasMoved.value) {
      const distanceX = Math.abs(pointer.x - mouseDownPosition.value.x)
      const distanceY = Math.abs(pointer.y - mouseDownPosition.value.y)
      if (distanceX > DRAG_THRESHOLD || distanceY > DRAG_THRESHOLD) {
        hasMoved.value = true
      }
    }

    // 只有真正移动时才更新视口
    if (hasMoved.value) {
      const dx = pointer.x - lastPointerPosition.value.x
      const dy = pointer.y - lastPointerPosition.value.y

      // Stage x/y 直接跟随鼠标移动
      canvasStore.setViewport({
        x: canvasStore.viewport.x + dx,
        y: canvasStore.viewport.y + dy,
      })
    }

    lastPointerPosition.value = pointer
  }

  /**
   * 鼠标释放（结束拖动）
   */
  const handleMouseUp = () => {
    isPanning.value = false
    hasMoved.value = false
  }

  /**
   * 点击画布时取消所有的选中
   * 只有点击空白区域（Stage 本身）且没有拖动时才取消选中
   */
  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    // 如果发生了拖动，不处理点击
    if (hasMoved.value) return

    // 只有点击 Stage 本身（空白区域）时才取消选中
    // e.target 是被点击的对象，如果是 Stage 说明点击了空白区域
    if (e.target === e.target.getStage()) {
      canvasStore.clearSelection()
    }
  }

  /**
   * 键盘事件处理
   * Delete/Backspace: 删除选中的节点或路径线
   * Ctrl+D: 复制选中的节点（路径线不支持复制）
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    // 检查是否在可编辑元素中（输入框、文本域、可编辑div等）
    const target = e.target as HTMLElement
    const isEditableElement =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable

    // 如果在可编辑元素中，不处理快捷键
    if (isEditableElement) {
      return
    }

    // Delete/Backspace 键：删除选中的节点或路径线
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()

      // 删除选中的节点
      if (canvasStore.selectedType === 'node' && canvasStore.selectedNodeIds.length > 0) {
        canvasStore.deleteSelectedNodes()
      }
      // 删除选中的路径线
      else if (canvasStore.selectedType === 'path' && canvasStore.selectedPathId) {
        canvasStore.deletePathLine(canvasStore.selectedPathId)
      }
      return
    }

    // Ctrl+D：复制选中的节点（仅节点支持复制）
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault()

      // 只有选中节点时才能复制
      if (canvasStore.selectedType === 'node' && canvasStore.selectedNodeIds.length > 0) {
        duplicateSelectedNodes()
      }
      return
    }
  }

  /**
   * 复制选中的节点
   * 复制后的节点会偏移一定距离，并自动选中
   */
  const duplicateSelectedNodes = () => {
    const selectedNodes = canvasStore.nodes.filter(node =>
      canvasStore.selectedNodeIds.includes(node.id)
    )

    if (selectedNodes.length === 0) return

    const newIds: string[] = []
    const offset = 20 // 复制偏移量（画布坐标）

    selectedNodes.forEach(node => {
      // 创建节点副本，位置偏移
      // 只传递必需的字段，其他字段会从原节点继承
      const newNode = canvasStore.addNodeFromData({
        type: node.type,
        x: node.x + offset,
        y: node.y + offset,
        // 可选字段
        nodeAttr: node.nodeAttr,
        nodeType: node.nodeType,
        leftStation: node.leftStation,
        rightStation: node.rightStation,
        navigationMode: node.navigationMode,
        avoidable: node.avoidable,
        enable: node.enable,
        speed: node.speed,
        dir: node.dir,
        floor: node.floor,
        regionName: node.regionName,
        stationName: node.stationName,
      })
      newIds.push(newNode.id)
    })

    // 选中新复制的节点
    canvasStore.clearSelection()
    newIds.forEach(id => canvasStore.selectNode(id, true))
  }

  // 监听键盘事件
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  /**
   * 屏幕坐标转换为画布坐标（笛卡尔坐标系）
   * @param screenX 屏幕 X 坐标
   * @param screenY 屏幕 Y 坐标
   * @returns 画布坐标 { x, y }
   */
  const screenToCanvas = (screenX: number, screenY: number) => {
    const scale = canvasStore.viewport.scale
    const canvasX = (screenX - canvasStore.viewport.x) / scale
    const canvasY = -(screenY - canvasStore.viewport.y) / scale
    return { x: canvasX, y: canvasY }
  }

  /**
   * 画布坐标转换为屏幕坐标
   * @param canvasX 画布 X 坐标
   * @param canvasY 画布 Y 坐标
   * @returns 屏幕坐标 { x, y }
   */
  const canvasToScreen = (canvasX: number, canvasY: number) => {
    const scale = canvasStore.viewport.scale
    const screenX = canvasX * scale + canvasStore.viewport.x
    const screenY = -canvasY * scale + canvasStore.viewport.y
    return { x: screenX, y: screenY }
  }

  return {
    // 状态
    isPanning,
    hasMoved,
    mousePosition,

    // 事件处理器
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleClick,

    // 工具方法
    screenToCanvas,
    canvasToScreen,
  }
}
