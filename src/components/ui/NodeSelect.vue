<template>
  <Select v-model="selectedValue" :placeholder="placeholder">
    <SelectItem v-for="node in nodes" :key="node.id" :value="node.node">
      节点 {{ node.node }} ({{ node.x }}, {{ node.y }})
    </SelectItem>
  </Select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import Select from '@/components/ui/Select.vue'
import SelectItem from '@/components/ui/SelectItem.vue'

const props = defineProps<{
  modelValue: number | null
  placeholder?: string
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
