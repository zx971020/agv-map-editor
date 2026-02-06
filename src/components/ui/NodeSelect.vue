<template>
  <Select v-model="selectedValue">
    <SelectTrigger>
      <SelectValue :placeholder="placeholder || '选择节点'" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="node in nodes" :key="node.id" :value="node.node">
        节点 {{ node.node }} ({{ node.x }}, {{ node.y }})
      </SelectItem>
    </SelectContent>
  </Select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps<{
  modelValue: number | null
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const canvasStore = useCanvasStore()

// 获取所有节点
const nodes = computed(() => canvasStore.nodes)

// 双向绑定
const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>
