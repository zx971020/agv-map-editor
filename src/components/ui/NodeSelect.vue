<template>
  <div class="relative">
    <!-- 输入框 -->
    <div class="relative">
      <el-input
        ref="inputRef"
        v-model="searchQuery"
        :placeholder="placeholder || '输入节点编号搜索...'"
        :disabled="disabled"
        @focus="handleFocus"
        @input="handleInput"
        @keydown.enter.prevent="handleEnter"
        @keydown.escape="showDropdown = false"
        @keydown.down.prevent="handleArrowDown"
        @keydown.up.prevent="handleArrowUp"
        clearable
      />
    </div>

    <!-- 下拉列表 -->
    <div
      v-if="showDropdown && isInitialized"
      class="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-[300px] overflow-y-auto"
      @mousedown.prevent
    >
      <div
        v-for="(node, index) in displayedNodes"
        :key="node.id"
        :class="[
          'px-3 py-2 cursor-pointer text-sm',
          index === highlightedIndex
            ? 'bg-accent text-accent-foreground'
            : 'hover:bg-accent hover:text-accent-foreground',
          selectedValue === node.node ? 'bg-primary/10' : '',
        ]"
        @click="handleSelect(node.node)"
      >
        <div class="flex items-center justify-between">
          <span class="font-medium">节点 {{ node.node }}</span>
          <span class="text-xs text-muted-foreground"
            >({{ Math.round(node.x) }}, {{ Math.round(node.y) }})</span
          >
        </div>
      </div>

      <!-- 加载更多提示 -->
      <div v-if="hasMore" class="px-3 py-2 text-xs text-center border-t text-muted-foreground">
        显示前 {{ displayLimit }} 个结果，继续输入以筛选
      </div>

      <!-- 无结果提示 -->
      <div
        v-if="filteredNodes.length === 0 && searchQuery"
        class="px-3 py-2 text-sm text-center text-muted-foreground"
      >
        未找到匹配的节点
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import type { CanvasNode } from '@/types'

const props = defineProps<{
  modelValue: number | null
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const canvasStore = useCanvasStore()

// 状态
const searchQuery = ref('')
const showDropdown = ref(false)
const highlightedIndex = ref(0)
const displayLimit = ref(50)
const inputRef = ref<HTMLInputElement | null>(null)
const isInitialized = ref(false) // 延迟初始化标志
const sortedNodesCache = ref<CanvasNode[]>([]) // 缓存排序后的节点

// 双向绑定
const selectedValue = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

// 初始化排序缓存（仅在需要时执行一次）
const initializeSortedNodes = () => {
  if (sortedNodesCache.value.length === 0) {
    sortedNodesCache.value = [...canvasStore.nodes].sort((a, b) => {
      const aNum = typeof a.node === 'number' ? a.node : parseInt(String(a.node))
      const bNum = typeof b.node === 'number' ? b.node : parseInt(String(b.node))
      return aNum - bNum
    })
  }
}

// 筛选节点（优化：使用缓存）
const filteredNodes = computed(() => {
  const query = searchQuery.value.trim()

  if (!query) {
    // 无搜索词时，返回缓存的排序节点
    return sortedNodesCache.value
  }

  // 有搜索词：筛选匹配的节点
  const queryLower = query.toLowerCase()
  const filtered = sortedNodesCache.value.filter(node => {
    const nodeStr = String(node.node).toLowerCase()
    return nodeStr.includes(queryLower)
  })

  // 完全匹配的排在前面
  return filtered.sort((a, b) => {
    const aStr = String(a.node)
    const bStr = String(b.node)
    const aExact = aStr === query
    const bExact = bStr === query
    if (aExact && !bExact) return -1
    if (!aExact && bExact) return 1
    return 0
  })
})

// 显示的节点（懒加载）
const displayedNodes = computed(() => {
  return filteredNodes.value.slice(0, displayLimit.value)
})

// 是否有更多节点
const hasMore = computed(() => {
  return filteredNodes.value.length > displayLimit.value
})

// 监听选中值变化，更新输入框显示（优化：不使用 immediate）
watch(
  () => props.modelValue,
  newValue => {
    if (newValue !== null && !showDropdown.value) {
      // 只在下拉框关闭时更新显示文本
      const node = canvasStore.nodes.find(n => n.node === newValue)
      if (node) {
        searchQuery.value = `节点 ${node.node} (${Math.round(node.x)}, ${Math.round(node.y)})`
      }
    } else if (newValue === null) {
      searchQuery.value = ''
    }
  }
)

// 组件挂载时初始化选中值的显示
onMounted(() => {
  if (props.modelValue !== null) {
    const node = canvasStore.nodes.find(n => n.node === props.modelValue)
    if (node) {
      searchQuery.value = `节点 ${node.node} (${Math.round(node.x)}, ${Math.round(node.y)})`
    }
  }
})

// 处理焦点（延迟初始化）
const handleFocus = () => {
  if (!isInitialized.value) {
    // 首次获得焦点时才初始化排序
    initializeSortedNodes()
    isInitialized.value = true
  }
  showDropdown.value = true
}

// 处理输入
const handleInput = () => {
  if (!isInitialized.value) {
    initializeSortedNodes()
    isInitialized.value = true
  }
  showDropdown.value = true
  highlightedIndex.value = 0
  displayLimit.value = 50
}

// 处理选择
const handleSelect = (nodeValue: number) => {
  selectedValue.value = nodeValue
  showDropdown.value = false
  highlightedIndex.value = 0
}

// 处理清除
const handleClear = () => {
  selectedValue.value = null
  searchQuery.value = ''
  showDropdown.value = false
}

// 处理回车
const handleEnter = () => {
  if (displayedNodes.value.length > 0 && highlightedIndex.value >= 0) {
    handleSelect(displayedNodes.value[highlightedIndex.value].node)
  }
}

// 处理向下箭头
const handleArrowDown = () => {
  if (highlightedIndex.value < displayedNodes.value.length - 1) {
    highlightedIndex.value++
    // 自动加载更多
    if (highlightedIndex.value >= displayLimit.value - 10 && hasMore.value) {
      displayLimit.value += 50
    }
  }
}

// 处理向上箭头
const handleArrowUp = () => {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--
  }
}

// 点击外部关闭下拉框
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showDropdown.value = false
  }
}

// 监听点击外部
watch(showDropdown, newValue => {
  if (newValue) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>
