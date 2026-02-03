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

    <!-- 元素网格 - 从 JSON 动态渲染 -->
    <div class="grid grid-cols-2 gap-2">
      <div
        v-for="element in elements"
        :key="element.type"
        class="group flex cursor-grab flex-col items-center gap-2 rounded-lg border border-border bg-background p-3 transition-all hover:border-primary hover:bg-accent/50 hover:shadow-md active:cursor-grabbing active:scale-95"
        draggable="true"
        :data-type="element.type"
        :data-label="element.name"
        :data-node-attr="element.nodeAttr"
        :data-node-type="element.nodeType"
        :data-avoidable="element.avoidable"
        @dragstart="handleDragStart($event, element)"
      >
        <!-- 元素图标 -->
        <div
          class="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-2xl font-bold transition-all group-hover:scale-110"
        >
          <img
            v-if="element.icon"
            :src="getIconPath(element.icon)"
            :alt="element.name"
            class="h-10 w-10 object-contain"
            @error="handleImageError"
          />
          <span v-else class="text-lg">{{ element.name.charAt(0) }}</span>
        </div>

        <!-- 元素标签 -->
        <div class="text-xs font-medium text-foreground">
          {{ element.name }}
        </div>
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Panel from '@/components/common/Panel.vue'
import IconButton from '@/components/ui/IconButton.vue'
import elementListData from '@/assets/element-list.json'
import type { ElementListItem } from '@/types'

// 元素列表
const elements = ref<ElementListItem[]>(elementListData)

// 获取图标路径
const getIconPath = (iconPath: string) => {
  // 将相对路径转换为绝对路径
  if (iconPath.startsWith('./images/')) {
    return new URL(`../../assets/${iconPath.replace('./', '')}`, import.meta.url).href
  }
  return iconPath
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 图片加载失败时隐藏图片，显示文字
  img.style.display = 'none'
  // 显示父元素中的备用文字
  const parent = img.parentElement
  if (parent) {
    const fallbackText = parent.querySelector('span')
    if (fallbackText) {
      fallbackText.style.display = 'block'
    }
  }
}

// 处理拖拽开始
const handleDragStart = (event: DragEvent, element: ElementListItem) => {
  if (!event.dataTransfer) return

  // 设置拖拽数据
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/json', JSON.stringify(element))
  event.dataTransfer.setData('text/plain', element.name)
}
</script>
