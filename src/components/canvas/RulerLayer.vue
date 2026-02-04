<template>
  <v-layer v-if="canvasStore.ruler.show" :config="{ listening: false }">
    <!-- 水平标尺（底部） -->
    <v-group>
      <!-- 标尺背景 -->
      <v-rect
        :config="{
          x: 0,
          y: 0,
          width: canvasStore.canvasWidth,
          height: canvasStore.ruler.size,
          fill: '#f9fafb',
          opacity: 0.9,
        }"
      />

      <!-- 水平刻度线和文字 -->
      <template v-for="tick in horizontalTicks" :key="`h-${tick.value}`">
        <!-- 刻度线 -->
        <v-line
          :config="{
            points: [
              tick.pos,
              0,
              tick.pos,
              tick.isMajor ? canvasStore.ruler.size * 0.6 : canvasStore.ruler.size * 0.3,
            ],
            stroke: '#6b7280',
            strokeWidth: tick.isMajor ? 1.5 : 1,
            scaleY: -1,
          }"
        />

        <!-- 刻度文字（主刻度） -->
        <v-text
          v-if="tick.isMajor"
          :config="{
            x: tick.pos,
            y: canvasStore.ruler.size * 0.7,
            text: tick.value.toString(),
            fontSize: 10,
            fill: '#374151',
            align: 'center',
            offsetX: 15,
            scaleY: -1,
          }"
        />
      </template>
    </v-group>

    <!-- 垂直标尺（左侧） -->
    <v-group>
      <!-- 标尺背景 -->
      <v-rect
        :config="{
          x: 0,
          y: 0,
          width: canvasStore.ruler.size,
          height: canvasStore.canvasHeight,
          fill: '#f9fafb',
          opacity: 0.9,
        }"
      />

      <!-- 垂直刻度线和文字 -->
      <template v-for="tick in verticalTicks" :key="`v-${tick.value}`">
        <!-- 刻度线 -->
        <v-line
          :config="{
            points: [
              0,
              tick.pos,
              tick.isMajor ? canvasStore.ruler.size * 0.6 : canvasStore.ruler.size * 0.3,
              tick.pos,
            ],
            stroke: '#6b7280',
            strokeWidth: tick.isMajor ? 1.5 : 1,
            scaleY: -1,
          }"
        />

        <!-- 刻度文字（主刻度） -->
        <v-text
          v-if="tick.isMajor"
          :config="{
            x: canvasStore.ruler.size * 0.1,
            y: tick.pos,
            text: tick.value.toString(),
            fontSize: 10,
            fill: '#374151',
            align: 'left',
            offsetY: 5,
            scaleY: -1,
          }"
        />
      </template>
    </v-group>
  </v-layer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'

const canvasStore = useCanvasStore()

interface Tick {
  pos: number
  value: number
  isMajor: boolean
}

// 计算水平标尺刻度（优化：限制刻度数量）
const horizontalTicks = computed<Tick[]>(() => {
  const ticks: Tick[] = []
  const interval = canvasStore.rulerInterval
  const minorInterval = interval / 5

  // 限制可见区域
  const viewport = canvasStore.viewport
  const visibleWidth = 2000
  const startX = Math.max(
    0,
    Math.floor(-viewport.x / viewport.scale / minorInterval) * minorInterval
  )
  const endX = Math.min(canvasStore.canvasWidth, startX + visibleWidth)

  for (let x = startX; x <= endX; x += minorInterval) {
    ticks.push({
      pos: x,
      value: x,
      isMajor: x % interval === 0,
    })
  }

  return ticks
})

// 计算垂直标尺刻度（优化：限制刻度数量）
const verticalTicks = computed<Tick[]>(() => {
  const ticks: Tick[] = []
  const interval = canvasStore.rulerInterval
  const minorInterval = interval / 5

  // 限制可见区域
  const viewport = canvasStore.viewport
  const visibleHeight = 2000
  const startY = Math.max(
    0,
    Math.floor(-viewport.y / viewport.scale / minorInterval) * minorInterval
  )
  const endY = Math.min(canvasStore.canvasHeight, startY + visibleHeight)

  for (let y = startY; y <= endY; y += minorInterval) {
    ticks.push({
      pos: y,
      value: y,
      isMajor: y % interval === 0,
    })
  }

  return ticks
})
</script>
