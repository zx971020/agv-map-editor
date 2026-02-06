<template>
  <v-group
    :config="groupConfig"
    @click="handleClick"
    @dragend="handleDragEnd"
    @contextmenu="handleContextMenu"
  >
    <!-- 背景圆形 -->
    <v-circle :config="circleConfig" />

    <!-- 元素图标（简单的文字） -->
    <v-text :config="iconConfig" />

    <!-- 元素标签 -->
    <v-text :config="labelConfig" />

    <!-- 选中状态指示器 -->
    <v-circle v-if="isSelected" :config="selectionConfig" />
  </v-group>

  <!-- 右键菜单 -->
  <ContextMenu :visible="contextMenuVisible" :position="contextMenuPosition" @close="closeContextMenu">
    <ContextMenuItem @click="handleEdit">
      <template #default>编辑节点</template>
    </ContextMenuItem>
    <ContextMenuItem @click="handleCreatePath">
      <template #default>创建路径</template>
    </ContextMenuItem>
    <div class="my-1 h-px bg-border"></div>
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

// 组件配置（使用 computed 确保响应式更新）
const groupConfig = computed(() => ({
  x: props.node.x,
  y: props.node.y,
  rotation: props.node.rotation,
  draggable: true,
}))

// 是否选中
const isSelected = computed(() => {
  return canvasStore.selectedIds.includes(props.node.id)
})

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

// 圆形配置（响应式）
const circleConfig = computed(() => ({
  x: 0,
  y: 0,
  radius: props.node.width / 2,
  fill: isSelected.value ? '#3b82f6' : '#60a5fa',
  stroke: isSelected.value ? '#1e40af' : '#3b82f6',
  strokeWidth: 2,
  shadowColor: 'black',
  shadowBlur: 10,
  shadowOpacity: 0.3,
  shadowOffsetY: -5,
}))

// 图标配置（响应式）
const iconConfig = computed(() => ({
  x: -10,
  y: 10,
  text: getIconText(props.node.type),
  fontSize: 20,
  fill: 'white',
  scaleY: -1,
}))

// 标签配置（响应式）
const labelConfig = computed(() => ({
  x: -props.node.label.length * 3,
  y: -(props.node.height / 2 + 5),
  text: props.node.label,
  fontSize: 12,
  fill: '#1f2937',
  scaleY: -1,
}))

// 选中指示器配置（响应式）
const selectionConfig = computed(() => ({
  x: 0,
  y: 0,
  radius: props.node.width / 2 + 5,
  stroke: '#3b82f6',
  strokeWidth: 3,
  dash: [5, 5],
}))

// 点击事件
const handleClick = (e: any) => {
  const isMultiSelect = e.evt.ctrlKey || e.evt.metaKey
  canvasStore.selectNode(props.node.id, isMultiSelect)
}

// 拖动结束事件
const handleDragEnd = (e: any) => {
  const node = e.target
  const newX = node.x()
  const newY = node.y()

  // 吸附到网格
  const snappedPos = canvasStore.snapToGridPoint(newX, newY)

  // 更新节点位置
  canvasStore.updateNode(props.node.id, {
    x: snappedPos.x,
    y: snappedPos.y,
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
