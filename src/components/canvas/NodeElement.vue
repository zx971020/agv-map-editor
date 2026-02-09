<template>
  <v-group
    :config="groupConfig"
    @click="handleClick"
    @dragmove="handleDragMove"
    @dragend="handleDragEnd"
    @contextmenu="handleContextMenu"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 选中状态指示器（最外层） -->
    <v-circle v-if="isSelected" :config="selectionConfig" />

    <!-- 主圆形（渐变效果） -->
    <v-circle :config="circleConfig" />

    <!-- 内圈装饰 -->
    <v-circle :config="innerCircleConfig" />

    <!-- 元素图标（中心） -->
    <v-text :config="iconConfig" />

    <!-- 节点编号徽章背景 -->
    <v-circle :config="badgeCircleConfig" />

    <!-- 节点编号文字 -->
    <v-text :config="badgeTextConfig" />

    <!-- 悬停状态高亮 -->
    <v-circle v-if="isHovered && !isSelected" :config="hoverConfig" />
  </v-group>

  <!-- 右键菜单 -->
  <ContextMenu
    :visible="contextMenuVisible"
    :position="contextMenuPosition"
    @close="closeContextMenu"
  >
    <ContextMenuItem @click="handleEdit">
      <template #default>编辑节点</template>
    </ContextMenuItem>
    <ContextMenuItem @click="handleCreatePath">
      <template #default>创建路径</template>
    </ContextMenuItem>
    <div class="h-px my-1 bg-border"></div>
    <ContextMenuItem variant="danger" @click="handleDelete">
      <template #default>删除节点</template>
    </ContextMenuItem>
  </ContextMenu>

  <!-- 路径表单对话框 -->
  <PathFormDialog
    :open="pathDialogOpen"
    :initial-start-node="node.node"
    @update:open="pathDialogOpen = $event"
    @success="handlePathCreated"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import ContextMenuItem from '@/components/ui/ContextMenuItem.vue'
import PathFormDialog from '@/components/dialogs/PathFormDialog.vue'
import type { CanvasNode } from '@/types'

const props = defineProps<{
  node: CanvasNode
}>()

const canvasStore = useCanvasStore()

// 右键菜单状态
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })

// 路径对话框状态
const pathDialogOpen = ref(false)

// 悬停状态
const isHovered = ref(false)

// 组件配置（使用 computed 确保响应式更新）
const groupConfig = computed(() => {
  const scale = canvasStore.viewport.scale
  return {
    x: props.node.x,
    y: props.node.y,
    rotation: props.node.rotation,
    draggable: true,
    scaleX: 1 / scale, // 抵消画布缩放
    scaleY: 1 / scale, // 抵消画布缩放
  }
})

// 是否选中
const isSelected = computed(() => {
  return canvasStore.selectedNodeIds.includes(props.node.id)
})

// 根据元素类型获取颜色
const getNodeColor = (type: number): { fill: string; stroke: string; dark: string } => {
  const colorMap: Record<number, { fill: string; stroke: string; dark: string }> = {
    1: { fill: '#3B82F6', stroke: '#2563EB', dark: '#1E40AF' }, // 工位 - 蓝色
    2: { fill: '#8B5CF6', stroke: '#7C3AED', dark: '#6D28D9' }, // 人工工位 - 紫色
    3: { fill: '#10B981', stroke: '#059669', dark: '#047857' }, // 充电站 - 绿色
    4: { fill: '#F59E0B', stroke: '#D97706', dark: '#B45309' }, // 机械手 - 橙色
    5: { fill: '#EF4444', stroke: '#DC2626', dark: '#B91C1C' }, // 门 - 红色
    6: { fill: '#06B6D4', stroke: '#0891B2', dark: '#0E7490' }, // 停靠区 - 青色
    7: { fill: '#6B7280', stroke: '#4B5563', dark: '#374151' }, // 路径点 - 灰色
    12: { fill: '#EC4899', stroke: '#DB2777', dark: '#BE185D' }, // 货架 - 粉色
  }
  return colorMap[type] || { fill: '#3B82F6', stroke: '#2563EB', dark: '#1E40AF' }
}

// 根据元素类型获取图标文字
const getIconText = (type: number): string => {
  const iconMap: Record<number, string> = {
    1: '工', // 工位
    2: '人', // 人工工位
    3: '充', // 充电站
    4: '机', // 机械手
    5: '门', // 门
    6: '停', // 停靠区
    7: '路', // 路径点
    12: '货', // 货架
  }
  return iconMap[type] || '?'
}

// 获取节点颜色
const nodeColors = computed(() => getNodeColor(props.node.type))

// 主圆形配置（渐变效果）
const circleConfig = computed(() => {
  const colors = nodeColors.value
  return {
    x: 0,
    y: 0,
    radius: props.node.width / 2,
    fill: isSelected.value ? colors.dark : isHovered.value ? colors.stroke : colors.fill,
    stroke: isSelected.value ? colors.dark : colors.stroke,
    strokeWidth: isSelected.value ? 3 : 2,
    shadowColor: 'black',
    shadowBlur: isHovered.value ? 15 : 10,
    shadowOpacity: isHovered.value ? 0.4 : 0.3,
    shadowOffsetY: isHovered.value ? -6 : -5,
  }
})

// 内圈装饰配置
const innerCircleConfig = computed(() => {
  const colors = nodeColors.value
  return {
    x: 0,
    y: 0,
    radius: props.node.width / 2 - 4,
    stroke: 'rgba(255, 255, 255, 0.3)',
    strokeWidth: 1,
  }
})

// 图标配置（中心）
const iconConfig = computed(() => ({
  x: -10,
  y: 10,
  text: getIconText(props.node.type),
  fontSize: 20,
  fontStyle: 'bold',
  fill: 'white',
  scaleY: -1,
}))

// 节点编号徽章圆形配置
const badgeCircleConfig = computed(() => {
  const radius = props.node.width / 2
  const badgeSize = 12
  return {
    x: radius * 0.7,
    y: radius * 0.7,
    radius: badgeSize,
    fill: '#0F172A', // slate-900
    stroke: 'white',
    strokeWidth: 2,
    shadowColor: 'black',
    shadowBlur: 4,
    shadowOpacity: 0.3,
  }
})

// 节点编号文字配置
const badgeTextConfig = computed(() => {
  const radius = props.node.width / 2
  const nodeNumber = String(props.node.node)
  const fontSize = nodeNumber.length > 2 ? 9 : 10
  const offsetX = nodeNumber.length > 2 ? -8 : nodeNumber.length > 1 ? -6 : -3

  return {
    x: radius * 0.7 + offsetX,
    y: radius * 0.7 + 5,
    text: nodeNumber,
    fontSize: fontSize,
    fontStyle: 'bold',
    fill: 'white',
    scaleY: -1,
  }
})

// 选中指示器配置
const selectionConfig = computed(() => ({
  x: 0,
  y: 0,
  radius: props.node.width / 2 + 6,
  stroke: '#2563EB', // blue-600
  strokeWidth: 3,
  dash: [8, 4],
  shadowColor: '#2563EB',
  shadowBlur: 8,
  shadowOpacity: 0.5,
}))

// 悬停状态高亮配置
const hoverConfig = computed(() => ({
  x: 0,
  y: 0,
  radius: props.node.width / 2 + 3,
  stroke: nodeColors.value.stroke,
  strokeWidth: 2,
  opacity: 0.5,
}))

// 点击事件
const handleClick = (e: any) => {
  const isMultiSelect = e.evt.ctrlKey || e.evt.metaKey
  canvasStore.selectNode(props.node.id, isMultiSelect)
}

// 拖动中事件（实时更新路径线）
const handleDragMove = (e: any) => {
  const node = e.target
  const newX = node.x()
  const newY = node.y()

  // 实时更新节点位置（不吸附网格）
  canvasStore.updateNode(props.node.id, {
    x: Math.round(newX),
    y: Math.round(newY),
  })
}

// 拖动结束事件
const handleDragEnd = (e: any) => {
  const node = e.target
  const newX = node.x()
  const newY = node.y()

  // 吸附到网格
  const snappedPos = canvasStore.snapToGridPoint(newX, newY)

  // 更新节点位置到吸附后的位置（确保是整数）
  canvasStore.updateNode(props.node.id, {
    x: Math.round(snappedPos.x),
    y: Math.round(snappedPos.y),
  })
}

// 右键菜单事件
const handleContextMenu = (e: any) => {
  e.evt.preventDefault()

  // 获取鼠标位置
  const mouseX = e.evt.clientX
  const mouseY = e.evt.clientY

  // 设置菜单位置
  contextMenuPosition.value = { x: mouseX, y: mouseY }
  contextMenuVisible.value = true

  // 选中当前节点（如果未选中）
  if (!isSelected.value) {
    canvasStore.selectNode(props.node.id, false)
  }
}

// 鼠标进入事件
const handleMouseEnter = () => {
  isHovered.value = true
}

// 鼠标离开事件
const handleMouseLeave = () => {
  isHovered.value = false
}

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false
}

// 编辑节点
const handleEdit = () => {
  console.log('编辑节点:', props.node.node)
  // TODO: 打开节点编辑对话框
}

// 创建路径
const handleCreatePath = () => {
  pathDialogOpen.value = true
}

// 删除节点
const handleDelete = () => {
  if (confirm(`确定要删除节点 ${props.node.node} 吗？`)) {
    canvasStore.deleteNode(props.node.id)
  }
}

// 路径创建成功
const handlePathCreated = () => {
  console.log('路径创建成功')
}
</script>
