<template>
  <footer class="toolbar-modern flex h-12 items-center justify-between px-4">
    <!-- 左侧快捷键提示 -->
    <div class="text-xs text-muted-foreground">
      <span class="hidden lg:inline">Del: 删除 · Ctrl+D: 复制 · Shift: 吸附 · 方向键: 移动</span>
    </div>

    <!-- 右侧缩放控制 -->
    <div class="flex items-center gap-3">
      <span class="text-xs text-muted-foreground">缩放</span>
      <input
        v-model.number="zoomValue"
        type="range"
        min="50"
        max="200"
        class="zoom-range h-1.5 w-24 cursor-pointer appearance-none rounded-full outline-none"
      />
      <span class="min-w-[3rem] text-right text-xs font-medium text-foreground"
        >{{ zoomValue }}%</span
      >
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CANVAS_CONFIG } from '@/config'

// 缩放值
const zoomValue = ref(CANVAS_CONFIG.defaultZoom)
</script>

<style scoped>
/* 自定义滑块样式 - 现代化 */
.zoom-range {
  background: hsl(var(--border));
}

/* 深色模式下使用更明显的轨道颜色 */
.dark .zoom-range {
  background: hsl(var(--border));
}

/* Webkit 浏览器（Chrome, Safari, Edge） */
.zoom-range::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: hsl(var(--primary));
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.zoom-range::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow:
    0 0 0 4px hsl(var(--primary) / 0.15),
    0 1px 3px rgba(0, 0, 0, 0.3);
}

.zoom-range::-webkit-slider-thumb:active {
  transform: scale(1.1);
}

/* Firefox */
.zoom-range::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: hsl(var(--primary));
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.zoom-range::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow:
    0 0 0 4px hsl(var(--primary) / 0.15),
    0 1px 3px rgba(0, 0, 0, 0.3);
}

.zoom-range::-moz-range-thumb:active {
  transform: scale(1.1);
}

/* Firefox 轨道样式 */
.zoom-range::-moz-range-track {
  background: hsl(var(--border));
  border-radius: 9999px;
}
</style>
