<template>
  <Panel title="元素库">
    <template #actions>
      <IconButton variant="ghost" size="sm" title="筛选">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
          />
        </svg>
      </IconButton>
    </template>

    <!-- 元素网格 - 现代化设计 -->
    <div class="grid grid-cols-2 gap-2">
      <div
        v-for="(config, type) in elements"
        :key="type"
        class="group flex cursor-grab flex-col items-center gap-2 rounded-lg border border-border bg-background p-3 transition-all hover:border-primary hover:bg-accent/50 hover:shadow-md active:cursor-grabbing active:scale-95"
        draggable="true"
        :data-type="type"
        :data-label="config.label"
      >
        <!-- 元素图标 -->
        <div
          class="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-current text-lg font-bold transition-all group-hover:scale-110"
          :style="{ color: config.color }"
        >
          {{ config.icon }}
        </div>

        <!-- 元素标签 -->
        <div class="text-xs font-medium text-foreground">
          {{ config.label }}
        </div>
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import Panel from '@/components/common/Panel.vue'
import IconButton from '@/components/ui/IconButton.vue'
import { ELEMENT_CONFIG } from '@/config'

// 元素配置
const elements = ELEMENT_CONFIG
</script>
