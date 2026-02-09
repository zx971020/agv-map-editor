<template>
  <footer class="flex items-center justify-between h-12 px-4 toolbar-modern">
    <!-- 左侧快捷键提示 -->
    <div class="text-xs text-muted-foreground">
      <span class="hidden lg:inline">Del: 删除 · Ctrl+D: 复制 · Shift: 吸附 · 方向键: 移动 · Ctrl+鼠标左键: 移动画布</span>
    </div>
  </footer>
</template>

<script setup lang="ts">


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
