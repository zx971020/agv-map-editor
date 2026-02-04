<template>
  <v-layer v-if="canvasStore.grid.show" :config="{ listening: false }">
    <!-- 次网格线（浅色） -->
    <v-line
      v-for="(line, index) in minorGridLines"
      :key="`minor-${index}`"
      :config="{
        points: line.points,
        stroke: '#e5e7eb',
        strokeWidth: 1 / canvasStore.viewport.scale,
        opacity: 0.3,
      }"
    />

    <!-- 主网格线（深色） -->
    <v-line
      v-for="(line, index) in majorGridLines"
      :key="`major-${index}`"
      :config="{
        points: line.points,
        stroke: '#d1d5db',
        strokeWidth: 1.5 / canvasStore.viewport.scale,
        opacity: 0.5,
      }"
    />
  </v-layer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'

const canvasStore = useCanvasStore()

// 计算网格线（优化：只计算可见区域）
const gridLines = computed(() => {
  const lines: { points: number[]; isMajor: boolean }[] = []
  const baseSize = canvasStore.gridBaseSize
  const majorInterval = baseSize * 5

  // 计算可见区域
  const viewport = canvasStore.viewport
  const visibleWidth = 2000 // 限制可见区域宽度
  const visibleHeight = 2000 // 限制可见区域高度

  const startX = Math.max(0, Math.floor(-viewport.x / viewport.scale / baseSize) * baseSize)
  const endX = Math.min(canvasStore.canvasWidth, startX + visibleWidth)
  const startY = Math.max(0, Math.floor(-viewport.y / viewport.scale / baseSize) * baseSize)
  const endY = Math.min(canvasStore.canvasHeight, startY + visibleHeight)

  // 垂直线（限制数量）
  for (let x = startX; x <= endX; x += baseSize) {
    lines.push({
      points: [x, startY, x, endY],
      isMajor: x % majorInterval === 0,
    })
  }

  // 水平线（限制数量）
  for (let y = startY; y <= endY; y += baseSize) {
    lines.push({
      points: [startX, y, endX, y],
      isMajor: y % majorInterval === 0,
    })
  }

  return lines
})

// 次网格线
const minorGridLines = computed(() => {
  return gridLines.value.filter(line => !line.isMajor)
})

// 主网格线
const majorGridLines = computed(() => {
  return gridLines.value.filter(line => line.isMajor)
})
</script>
