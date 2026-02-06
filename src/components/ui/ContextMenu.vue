<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="menuRef"
      class="fixed z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      :style="{ top: `${position.y}px`, left: `${position.x}px` }"
      @click="handleMenuClick"
    >
      <slot />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  visible: boolean
  position: { x: number; y: number }
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
}>()

const menuRef = ref<HTMLElement | null>(null)

// 点击菜单项时关闭
const handleMenuClick = () => {
  emit('update:visible', false)
  emit('close')
}

// 点击外部关闭菜单
const handleClickOutside = (e: MouseEvent) => {
  if (props.visible && menuRef.value && !menuRef.value.contains(e.target as Node)) {
    emit('update:visible', false)
    emit('close')
  }
}

// 按 ESC 关闭菜单
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.visible) {
    emit('update:visible', false)
    emit('close')
  }
}

// 监听可见性变化，添加/移除事件监听器
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      // 延迟添加监听器，避免立即触发
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
      }, 0)
    } else {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }
)

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>
