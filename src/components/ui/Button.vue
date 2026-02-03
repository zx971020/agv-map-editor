<template>
  <button
    :type="nativeType"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- 加载图标 -->
    <svg
      v-if="loading"
      class="animate-spin"
      :class="iconSizeClass"
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

    <!-- 左侧图标 -->
    <span v-if="$slots.icon && !loading" :class="iconSizeClass">
      <slot name="icon" />
    </span>

    <!-- 按钮文字 -->
    <span v-if="$slots.default">
      <slot />
    </span>

    <!-- 右侧图标 -->
    <span v-if="$slots['icon-right']" :class="iconSizeClass">
      <slot name="icon-right" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  block?: boolean
  nativeType?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'secondary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
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

// 基础样式 - 现代化设计
const baseClasses =
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

// 尺寸样式 - 更大的触摸目标
const sizeClasses = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-11 px-6 text-base rounded-lg',
}

// 图标尺寸
const iconSizeClass = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }
  return sizes[props.size]
})

// 变体样式 - 现代化配色
const variantClasses = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm active:scale-[0.98]',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]',
  ghost: 'hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
  danger:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm active:scale-[0.98]',
  outline:
    'border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
}

const buttonClasses = computed(() => {
  const classes = [baseClasses, sizeClasses[props.size], variantClasses[props.variant]]

  if (props.block) {
    classes.push('w-full')
  }

  return classes.join(' ')
})
</script>
