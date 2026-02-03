<template>
  <div class="app-layout h-screen w-full overflow-hidden bg-background">
    <!-- 三栏 Grid 布局 -->
    <div
      class="grid h-full transition-all duration-300"
      :class="propertiesCollapsed ? 'grid-cols-[280px_1fr_0px]' : 'grid-cols-[280px_1fr_320px]'"
    >
      <!-- 左侧栏 - 现代化设计 -->
      <aside class="sidebar-modern flex flex-col gap-3 overflow-y-auto overflow-x-hidden p-3">
        <slot name="sidebar" />
      </aside>

      <!-- 中间工作区 -->
      <main class="workspace flex flex-col overflow-hidden">
        <slot name="workspace" />
      </main>

      <!-- 右侧属性栏 -->
      <aside
        class="properties relative border-l border-border bg-card transition-all duration-300"
        :class="{ 'w-0 min-w-0 border-l-0': propertiesCollapsed }"
      >
        <!-- 折叠按钮 - 固定在属性栏外侧 -->
        <button
          class="absolute left-0 top-1/2 z-50 flex h-16 w-6 -translate-x-full -translate-y-1/2 items-center justify-center rounded-l-md border border-r-0 border-border bg-card shadow-md transition-all hover:w-7 hover:bg-accent hover:shadow-lg active:scale-95"
          @click="toggleProperties"
          :title="propertiesCollapsed ? '展开属性栏 (Ctrl+\\)' : '折叠属性栏 (Ctrl+\\)'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="currentColor"
            class="h-4 w-4 transition-transform duration-300"
            :class="{ 'rotate-180': propertiesCollapsed }"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>

        <div v-show="!propertiesCollapsed" class="flex h-full flex-col gap-3 overflow-y-auto p-3">
          <slot name="properties" />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 属性栏折叠状态
const propertiesCollapsed = ref(false)

// 切换属性栏
const toggleProperties = () => {
  propertiesCollapsed.value = !propertiesCollapsed.value
}
</script>

<style scoped>
/* 自定义滚动条样式 */
.sidebar-modern::-webkit-scrollbar,
.properties::-webkit-scrollbar {
  width: 6px;
}

.sidebar-modern::-webkit-scrollbar-track,
.properties::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-modern::-webkit-scrollbar-thumb,
.properties::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.2);
  border-radius: 999px;
}

.sidebar-modern::-webkit-scrollbar-thumb:hover,
.properties::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.3);
}
</style>
