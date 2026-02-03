<template>
  <section class="panel-modern flex flex-col overflow-hidden">
    <!-- 面板头部 - 现代化设计 -->
    <header class="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
      <div class="flex items-center gap-3">
        <div class="text-sm font-semibold text-foreground">{{ title }}</div>
        <div v-if="subtitle" class="text-xs text-muted-foreground">{{ subtitle }}</div>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </header>

    <!-- 面板内容 -->
    <div class="flex-1 overflow-auto p-4">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>
