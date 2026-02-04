<template>
  <div class="flex flex-col flex-1 overflow-hidden canvas-area">
    <!-- Konva 画布容器 -->
    <div
      ref="containerRef"
      class="relative w-full h-full bg-slate-50 dark:bg-slate-900"
      @dragover.prevent="handleDragOver"
      @drop.prevent="handleDrop"
    >
      <!-- DOM 网格层（在画布下层） -->
      <div
        v-if="canvasStore.grid.show"
        class="absolute inset-0 pointer-events-none"
        :style="gridStyle"
      ></div>

      <v-stage
        ref="stageRef"
        :config="stageConfig"
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
      >
        <!-- 标尺层 -->
        <RulerLayer />

        <!-- 路径层 -->
        <v-layer ref="pathLayerRef">
          <!-- 路径元素将在这里渲染 -->
        </v-layer>

        <!-- 元素层 -->
        <v-layer ref="elementLayerRef">
          <!-- 渲染可见区域内的节点元素（视口剔除优化） -->
          <NodeElement v-for="node in visibleNodes" :key="node.id" :node="node" />
        </v-layer>

        <!-- 辅助层 -->
        <v-layer ref="helperLayerRef">
          <!-- 选择框、变换控制器等辅助元素 -->
        </v-layer>
      </v-stage>

      <!-- 空状态提示 -->
      <div
        v-if="canvasStore.nodes.length === 0"
        class="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none left-1/2 top-1/2"
      >
        <div
          class="flex flex-col items-center gap-4 p-8 border shadow-lg rounded-2xl border-border bg-card"
        >
          <div class="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-8 h-8 text-primary"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div class="text-center">
            <div class="text-sm font-semibold text-foreground">开始创建地图</div>
            <div class="mt-1 text-xs text-muted-foreground">从左侧拖拽元素到画布</div>
          </div>
        </div>
      </div>

      <!-- 画布信息显示 -->
      <div class="absolute px-3 py-2 text-xs text-white rounded-lg bottom-4 left-4 bg-black/60">
        <div>缩放: {{ Math.round(canvasStore.viewport.scale * 10000) / 100 }}%</div>
        <div>
          视口: ({{ Math.round(canvasStore.viewport.x) }}, {{ Math.round(canvasStore.viewport.y) }})
        </div>
        <div>鼠标: ({{ Math.round(mousePosition.x) }}, {{ Math.round(mousePosition.y) }})</div>
        <div>可见元素: {{ visibleNodes.length }} / {{ canvasStore.nodes.length }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import RulerLayer from '@/components/canvas/RulerLayer.vue'
import NodeElement from '@/components/canvas/NodeElement.vue'
import type { ElementListItem } from '@/types'

const canvasStore = useCanvasStore()

// 引用
const containerRef = ref<HTMLDivElement>()
const stageRef = ref()
const pathLayerRef = ref()
const elementLayerRef = ref()
const helperLayerRef = ref()

// 容器尺寸
const containerWidth = ref(800)
const containerHeight = ref(600)

// 计算可见区域内的节点（视口剔除优化）
const visibleNodes = computed(() => {
  const viewport = canvasStore.viewport
  const scale = viewport.scale

  // 计算可见区域（笛卡尔坐标）
  // 屏幕左边 x=0 → 画布 x = -viewport.x / scale
  // 屏幕上边 y=0 → 画布 y = viewport.y / scale (因为 scaleY 是负数)
  const viewLeft = -viewport.x / scale
  const viewRight = viewLeft + containerWidth.value / scale
  const viewTop = viewport.y / scale
  const viewBottom = viewTop - containerHeight.value / scale

  // 添加边距，避免边缘元素突然消失
  const margin = 100 / scale

  return canvasStore.nodes.filter(node => {
    return (
      node.x + node.width >= viewLeft - margin &&
      node.x <= viewRight + margin &&
      node.y + node.height >= viewBottom - margin &&
      node.y <= viewTop + margin
    )
  })
})

// DOM 网格样式
const gridStyle = computed(() => {
  const baseSize = canvasStore.gridBaseSize
  const scale = canvasStore.viewport.scale
  const x = canvasStore.viewport.x
  const y = canvasStore.viewport.y

  // 计算网格大小（屏幕像素）
  const gridSize = baseSize * scale
  const majorGridSize = gridSize * 5

  // 计算偏移量（考虑笛卡尔坐标系的 Y 轴翻转）
  const offsetX = x % gridSize
  const offsetY = y % gridSize

  return {
    backgroundImage: `
      linear-gradient(to right, #e5e7eb 1px, transparent 1px),
      linear-gradient(to bottom, #e5e7eb 1px, transparent 1px),
      linear-gradient(to right, #d1d5db 1.5px, transparent 1.5px),
      linear-gradient(to bottom, #d1d5db 1.5px, transparent 1.5px)
    `,
    backgroundSize: `
      ${gridSize}px ${gridSize}px,
      ${gridSize}px ${gridSize}px,
      ${majorGridSize}px ${majorGridSize}px,
      ${majorGridSize}px ${majorGridSize}px
    `,
    backgroundPosition: `
      ${offsetX}px ${offsetY}px,
      ${offsetX}px ${offsetY}px,
      ${offsetX}px ${offsetY}px,
      ${offsetX}px ${offsetY}px
    `,
    opacity: '0.6',
  }
})

// Stage 配置（右手笛卡尔坐标系 + 无极缩放 + 透明背景）
// viewport.x/y 直接对应 Stage 的 x/y（屏幕坐标）
const stageConfig = computed(() => ({
  width: containerWidth.value,
  height: containerHeight.value,
  x: canvasStore.viewport.x,
  y: canvasStore.viewport.y,
  scaleX: canvasStore.viewport.scale,
  scaleY: -canvasStore.viewport.scale, // Y 轴翻转实现笛卡尔坐标系
  draggable: false,
  // 设置透明背景，让下层的 DOM 网格可见
  container: undefined,
}))

// 拖动状态
const isPanning = ref(false)
const lastPointerPosition = ref({ x: 0, y: 0 })

// 鼠标位置（笛卡尔坐标）
const mousePosition = ref({ x: 0, y: 0 })

// 初始化容器尺寸
onMounted(() => {
  if (containerRef.value) {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        containerWidth.value = entry.contentRect.width
        containerHeight.value = entry.contentRect.height
      }
    })
    resizeObserver.observe(containerRef.value)
  }
})

// 鼠标滚轮缩放
const handleWheel = (e: any) => {
  e.evt.preventDefault()

  const stage = stageRef.value.getStage()
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

// 鼠标按下（开始拖动画布）
const handleMouseDown = (e: any) => {
  // 鼠标左键、中键都可以拖动画布
  if (e.evt.button === 0 || e.evt.button === 1) {
    isPanning.value = true
    const stage = stageRef.value.getStage()
    lastPointerPosition.value = stage.getPointerPosition()
  }
}

// 鼠标移动（拖动画布 + 更新鼠标位置）
const handleMouseMove = (e: any) => {
  const stage = stageRef.value.getStage()
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

  const dx = pointer.x - lastPointerPosition.value.x
  const dy = pointer.y - lastPointerPosition.value.y

  // Stage x/y 直接跟随鼠标移动
  canvasStore.setViewport({
    x: canvasStore.viewport.x + dx,
    y: canvasStore.viewport.y + dy,
  })

  lastPointerPosition.value = pointer
}

// 鼠标释放（结束拖动）
const handleMouseUp = () => {
  isPanning.value = false
}

// 处理拖拽悬停
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
}

// 处理元素拖放
const handleDrop = (e: DragEvent) => {
  e.preventDefault()

  if (!e.dataTransfer) return

  try {
    const elementData: ElementListItem = JSON.parse(e.dataTransfer.getData('application/json'))

    // 获取 Stage 和 Canvas 元素
    const stage = stageRef.value?.getStage()
    if (!stage) return

    // 获取 canvas 元素的位置
    const canvas = stage.content.querySelector('canvas')
    if (!canvas) return

    const canvasRect = canvas.getBoundingClientRect()

    // 计算鼠标相对于 canvas 的位置
    const mouseX = e.clientX - canvasRect.left
    const mouseY = e.clientY - canvasRect.top

    // 转换为画布坐标（笛卡尔坐标系）
    // 注意：Y 轴需要翻转，因为 Stage 的 scaleY 是负数
    const scale = canvasStore.viewport.scale
    const canvasX = (mouseX - canvasStore.viewport.x) / scale
    const canvasY = -(mouseY - canvasStore.viewport.y) / scale

    // 吸附到网格
    const snappedPos = canvasStore.snapToGridPoint(canvasX, canvasY)

    console.log(
      '拖放元素:',
      elementData.name,
      '鼠标位置:',
      { mouseX, mouseY },
      '画布坐标:',
      { canvasX, canvasY },
      '吸附后:',
      snappedPos
    )

    // 添加节点到画布
    canvasStore.addNode({
      id: `node_${Date.now()}`,
      type: elementData.type,
      label: elementData.name,
      x: snappedPos.x,
      y: snappedPos.y,
      width: 50,
      height: 50,
      rotation: 0,
      nodeAttr: elementData.nodeAttr,
      nodeType: elementData.nodeType,
      avoidable: elementData.avoidable,
    })
  } catch (error) {
    console.error('拖放元素失败:', error)
  }
}
</script>

<style scoped>
.canvas-area {
  cursor: default;
}

.canvas-area.panning {
  cursor: grab;
}

.canvas-area.panning:active {
  cursor: grabbing;
}

/* 确保 Konva Canvas 背景透明，让下层的 DOM 网格可见 */
:deep(canvas) {
  background: transparent !important;
}
</style>
