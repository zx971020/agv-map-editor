<template>
  <button
    class="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
    :class="variant === 'danger' && 'text-red-600 hover:text-red-700 focus:text-red-700'"
    @click="$emit('click')"
  >
    <span v-if="icon" class="mr-2 h-4 w-4">
      <component :is="icon" />
    </span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon?: Component
  variant?: 'default' | 'danger'
}>()

defineEmits<{
  click: []
}>()
</script>
