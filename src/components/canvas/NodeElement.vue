<template>
  <v-group :config="groupConfig" @click="handleClick" @dragend="handleDragEnd">
    <!-- 背景圆形 -->
    <v-circle :config="circleConfig" />

    <!-- 元素图标（简单的文字） -->
    <v-text :config="iconConfig" />

    <!-- 元素标签 -->
    <v-text :config="labelConfig" />

    <!-- 选中状态指示器 -->
    <v-circle v-if="isSelected" :config="selectionConfig" />
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import type { CanvasNode } from '@/types'

const props = defineProps<{
  node: CanvasNode
}>()

const canvasStore = useCanvasStore()

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
</script>
