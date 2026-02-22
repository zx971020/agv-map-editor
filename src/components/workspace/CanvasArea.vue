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
        @click="handleClick"
      >
        <!-- 路径层 -->
        <v-layer ref="pathLayerRef">
          <!-- 渲染可见区域内的路径线（视口剔除优化） -->
          <PathLineElement v-for="path in visiblePathLines" :key="path.id" :path="path" />
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
      <div class="absolute px-3 py-2 text-xs text-white rounded-lg bottom-4 right-4 bg-black/60">
        <div>缩放: {{ Math.round(canvasStore.viewport.scale * 10000) / 100 }}%</div>
        <div>
          视口: ({{ Math.round(canvasStore.viewport.x) }}, {{ Math.round(canvasStore.viewport.y) }})
        </div>
        <div>鼠标: ({{ Math.round(mousePosition.x) }}, {{ Math.round(mousePosition.y) }})</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import { useCanvasInteraction } from '@/composables/useCanvasInteraction'
import NodeElement from '@/components/canvas/NodeElement.vue'
import PathLineElement from '@/components/canvas/PathLineElement.vue'
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

// 使用画布交互 composable
const {
  mousePosition,
  handleWheel,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleClick,
  screenToCanvas,
} = useCanvasInteraction(stageRef, canvasStore)

// 计算可见区域边界（复用逻辑）
const viewportBounds = computed(() => {
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

  return {
    left: viewLeft - margin,
    right: viewRight + margin,
    top: viewTop + margin,
    bottom: viewBottom - margin,
  }
})

// 计算可见区域内的节点（视口剔除优化）
const visibleNodes = computed(() => {
  const bounds = viewportBounds.value

  return canvasStore.nodes.filter(node => {
    return (
      node.x + node.width >= bounds.left &&
      node.x <= bounds.right &&
      node.y + node.height >= bounds.bottom &&
      node.y <= bounds.top
    )
  })
})

// 计算可见区域内的路径线（视口剔除优化）
// 基于 visibleNodes 来过滤，只有 startNode 或 endNode 在可见节点中时才渲染
// 只有当 startNode 和 endNode 都不存在时不渲染
const visiblePathLines = computed(() => {
  // 创建可见节点的 node 编号集合，用于快速查找
  const visibleNodeIds = new Set(visibleNodes.value.map(n => n.node))

  return canvasStore.pathLines.filter(path => {
    // 检查起始节点和结束节点是否在可见节点中
    const startVisible = visibleNodeIds.has(path.startNode)
    const endVisible = visibleNodeIds.has(path.endNode)

    // 只要起始节点或结束节点有一个在可见节点中，就渲染该路径
    // 只有当两个节点都不可见时，才不渲染
    return startVisible || endVisible
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
    const { x: canvasX, y: canvasY } = screenToCanvas(mouseX, mouseY)

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

    // 使用新的 addNodeFromData 方法添加节点
    // 图形属性（width, height, rotation, label）由 createNode 自动补充默认值
    canvasStore.addNodeFromData({
      type: elementData.type,
      x: snappedPos.x,
      y: snappedPos.y,
      nodeAttr: elementData.nodeAttr,
      nodeType: elementData.nodeType,
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
