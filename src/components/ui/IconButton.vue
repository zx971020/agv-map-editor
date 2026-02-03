<template>
  <button
    :type="nativeType"
    :disabled="disabled || loading"
    :class="buttonClasses"
    :title="title"
    @click="handleClick"
  >
    <!-- 加载图标 -->
    <svg
      v-if="loading"
      class="animate-spin"
      :class="sizeClass"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>

    <!-- 图标 -->
    <span v-else :class="sizeClass">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type IconButtonSize = 'sm' | 'md' | 'lg'

interface IconButtonProps {
  variant?: IconButtonVariant
  size?: IconButtonSize
  disabled?: boolean
  loading?: boolean
  title?: string
  nativeType?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<IconButtonProps>(), {
  variant: 'ghost',
  size: 'md',
  disabled: false,
  loading: false,
  nativeType: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

// 基础样式
const baseClasses =
  'inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

// 尺寸样式（正方形）
const sizeClasses = {
  sm: 'h-9 w-9 rounded-lg',
  md: 'h-10 w-10 rounded-lg',
  lg: 'h-11 w-11 rounded-lg',
}

// 图标尺寸
const sizeClass = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
  }
  return sizes[props.size]
})

// 变体样式
const variantClasses = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm active:scale-95',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95',
  ghost: 'hover:bg-accent hover:text-accent-foreground active:scale-95',
  danger:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm active:scale-95',
}

const buttonClasses = computed(() => {
  return [baseClasses, sizeClasses[props.size], variantClasses[props.variant]].join(' ')
})
</script>
