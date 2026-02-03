<template>
  <div class="canvas-area flex flex-1 flex-col overflow-hidden canvas-modern">
    <!-- 画布区域 - 现代化设计 -->
    <div class="relative h-full overflow-auto">
      <!-- 画布舞台 -->
      <div
        class="canvas-stage relative mx-auto my-8 bg-white shadow-2xl dark:bg-slate-800"
        :style="{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          borderRadius: '12px',
        }"
      >
        <!-- 网格背景 - 现代化 -->
        <div
          class="grid absolute inset-0 rounded-xl"
          style="
            background-image:
              linear-gradient(hsl(var(--muted-foreground) / 0.08) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--muted-foreground) / 0.08) 1px, transparent 1px);
            background-size: 20px 20px;
          "
        ></div>

        <!-- 画布内容容器 -->
        <div class="canvas-content absolute inset-0 rounded-xl">
          <!-- 这里将放置画布元素 -->
        </div>
      </div>

      <!-- 空状态提示 - 现代化 -->
      <div
        class="empty-hint absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-in"
      >
        <div
          class="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 shadow-lg"
        >
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-8 w-8 text-primary"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CANVAS_CONFIG } from '@/config'

// 画布尺寸
const canvasWidth = ref(CANVAS_CONFIG.defaultWidth)
const canvasHeight = ref(CANVAS_CONFIG.defaultHeight)

// 缩放比例
const scale = ref(1)
</script>

<style scoped>
/* 自定义滚动条 */
.canvas-area::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.canvas-area::-webkit-scrollbar-track {
  background: transparent;
}

.canvas-area::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.2);
  border-radius: 999px;
}

.canvas-area::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.3);
}
</style>
