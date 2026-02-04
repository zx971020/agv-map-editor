<template>
  <v-group
    :config="{
      x: node.x,
      y: node.y,
      rotation: node.rotation,
      draggable: true,
    }"
    @click="handleClick"
    @dragend="handleDragEnd"
  >
    <!-- 背景圆形 -->
    <v-circle
      :config="{
        x: 0,
        y: 0,
        radius: node.width / 2,
        fill: isSelected ? '#3b82f6' : '#60a5fa',
        stroke: isSelected ? '#1e40af' : '#3b82f6',
        strokeWidth: 2,
        shadowColor: 'black',
        shadowBlur: 10,
        shadowOpacity: 0.3,
        shadowOffsetY: -5,
      }"
    />

    <!-- 元素图标（简单的文字） -->
    <v-text
      :config="{
        x: -10,
        y: 10,
        text: getIconText(node.type),
        fontSize: 20,
        fill: 'white',
        scaleY: -1,
      }"
    />

    <!-- 元素标签 -->
    <v-text
      :config="{
        x: -node.label.length * 3,
        y: -(node.height / 2 + 5),
        text: node.label,
        fontSize: 12,
        fill: '#1f2937',
        scaleY: -1,
      }"
    />

    <!-- 选中状态指示器 -->
    <v-circle
      v-if="isSelected"
      :config="{
        x: 0,
        y: 0,
        radius: node.width / 2 + 5,
        stroke: '#3b82f6',
        strokeWidth: 3,
        dash: [5, 5],
      }"
    />
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
