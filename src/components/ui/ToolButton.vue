<template>
  <button
    :type="nativeType"
    :disabled="disabled"
    :class="buttonClasses"
    :title="title"
    @click="handleClick"
  >
    <!-- 图标 -->
    <span v-if="$slots.icon" :class="iconSizeClass">
      <slot name="icon" />
    </span>

    <!-- 文字 -->
    <span v-if="$slots.default">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ToolButtonProps {
  active?: boolean
  disabled?: boolean
  title?: string
  nativeType?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<ToolButtonProps>(), {
  active: false,
  disabled: false,
  nativeType: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}

// 基础样式
const baseClasses =
  'inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-[13px] font-normal rounded-[2px] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50'

// 图标尺寸
const iconSizeClass = 'w-4 h-4'

// 状态样式
const buttonClasses = computed(() => {
  const classes = [baseClasses]

  if (props.active) {
    // 激活状态：深灰背景 + 白色文字
    classes.push('bg-[#525252] text-white border-[#1a1a1a] focus:ring-[#525252]')
  } else {
    // 未激活状态：透明背景 + 深色文字
    classes.push(
      'bg-transparent text-[#1a1a1a] border-transparent hover:bg-[#e8e8e8] hover:border-[#d0d0d0] focus:ring-[#d0d0d0]'
    )
  }

  return classes.join(' ')
})
</script>
