<template>
  <v-group>
    <!-- 直线路径 -->
    <v-line
      v-if="path.lineType === 0"
      :config="lineConfig"
      @click="handleClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    />

    <!-- 弧线路径（贝塞尔曲线） -->
    <v-line
      v-else
      :config="curveConfig"
      @click="handleClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    />

    <!-- 选中状态高亮 -->
    <v-line v-if="isSelected" :config="selectionConfig" />

    <!-- 箭头（单向时显示） -->
    <v-arrow v-if="path.showArrow && arrowConfig" :config="arrowConfig" />
  </v-group>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CanvasPathLine } from '@/types'
import { useCanvasStore } from '@/stores/canvasStore'

const props = defineProps<{
  path: CanvasPathLine
}>()

const canvasStore = useCanvasStore()
const isHovered = ref(false)

// 判断是否选中
const isSelected = computed(() => {
  return canvasStore.selectedPathId === props.path.id
})

// 获取起始和结束节点
const startNode = computed(() => {
  return canvasStore.nodes.find(n => n.node === props.path.startNode)
})

const endNode = computed(() => {
  return canvasStore.nodes.find(n => n.node === props.path.endNode)
})

// 计算路径中点（用于放置箭头）
const midPoint = computed(() => {
  if (!startNode.value || !endNode.value) return null

  if (props.path.lineType === 0) {
    // 直线：简单中点
    return {
      x: (startNode.value.x + endNode.value.x) / 2,
      y: (startNode.value.y + endNode.value.y) / 2,
    }
  } else {
    // 弧线：贝塞尔曲线中点（t=0.5）
    const t = 0.5
    const cpx = props.path.cpx || 0
    const cpy = props.path.cpy || 0
    return {
      x:
        Math.pow(1 - t, 2) * startNode.value.x +
        2 * (1 - t) * t * cpx +
        Math.pow(t, 2) * endNode.value.x,
      y:
        Math.pow(1 - t, 2) * startNode.value.y +
        2 * (1 - t) * t * cpy +
        Math.pow(t, 2) * endNode.value.y,
    }
  }
})

// 计算箭头角度
const arrowAngle = computed(() => {
  if (!startNode.value || !endNode.value) return 0

  if (props.path.lineType === 0) {
    // 直线：起点到终点的角度
    const dx = endNode.value.x - startNode.value.x
    const dy = endNode.value.y - startNode.value.y
    return Math.atan2(dy, dx)
  } else {
    // 弧线：在中点处的切线角度
    const t = 0.5
    const cpx = props.path.cpx || 0
    const cpy = props.path.cpy || 0
    const dx = 2 * (1 - t) * (cpx - startNode.value.x) + 2 * t * (endNode.value.x - cpx)
    const dy = 2 * (1 - t) * (cpy - startNode.value.y) + 2 * t * (endNode.value.y - cpy)
    return Math.atan2(dy, dx)
  }
})

// 直线配置
const lineConfig = computed(() => {
  if (!startNode.value || !endNode.value) return null

  return {
    points: [
      startNode.value.x,
      startNode.value.y,
      endNode.value.x,
      endNode.value.y,
    ],
    stroke: isHovered.value ? '#1e40af' : props.path.strokeColor,
    strokeWidth: isHovered.value ? props.path.strokeWidth + 1 : props.path.strokeWidth,
    dash: props.path.dash,
    lineCap: 'round',
    lineJoin: 'round',
    hitStrokeWidth: 10, // 增加点击区域
    listening: true,
  }
})

// 弧线配置（贝塞尔曲线）
const curveConfig = computed(() => {
  if (!startNode.value || !endNode.value) return null

  return {
    points: [
      startNode.value.x,
      startNode.value.y,
      props.path.cpx || 0,
      props.path.cpy || 0,
      endNode.value.x,
      endNode.value.y,
    ],
    stroke: isHovered.value ? '#1e40af' : props.path.strokeColor,
    strokeWidth: isHovered.value ? props.path.strokeWidth + 1 : props.path.strokeWidth,
    dash: props.path.dash,
    tension: 0.5, // 曲线张力
    bezier: true, // 启用贝塞尔曲线
    lineCap: 'round',
    lineJoin: 'round',
    hitStrokeWidth: 10,
    listening: true,
  }
})

// 箭头配置
const arrowConfig = computed(() => {
  if (!midPoint.value) return null

  return {
    x: midPoint.value.x,
    y: midPoint.value.y,
    points: [0, 0, -10, -5, -10, 5], // 箭头形状
    fill: props.path.strokeColor,
    stroke: props.path.strokeColor,
    strokeWidth: 1,
    closed: true,
    rotation: (arrowAngle.value * 180) / Math.PI, // 转换为角度
    listening: false,
  }
})

// 选中状态配置
const selectionConfig = computed(() => {
  if (!startNode.value || !endNode.value) return null

  const baseConfig =
    props.path.lineType === 0
      ? {
          points: [startNode.value.x, startNode.value.y, endNode.value.x, endNode.value.y],
        }
      : {
          points: [
            startNode.value.x,
            startNode.value.y,
            props.path.cpx || 0,
            props.path.cpy || 0,
            endNode.value.x,
            endNode.value.y,
          ],
          tension: 0.5,
          bezier: true,
        }

  return {
    ...baseConfig,
    stroke: '#3b82f6',
    strokeWidth: props.path.strokeWidth + 3,
    dash: [10, 5],
    opacity: 0.5,
    listening: false,
  }
})

// 点击事件
const handleClick = () => {
  canvasStore.selectPath(props.path.id)
}

// 鼠标悬停
const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
}
</script>
