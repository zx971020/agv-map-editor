<template>
  <div class="flex flex-col gap-2">
    <!-- 地图属性面板 -->
    <Panel title="地图属性" subtitle="基础尺寸">
      <div class="property-grid grid grid-cols-2 gap-2">
        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">宽度</span>
          <input
            type="number"
            v-model.number="canvasWidth"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">长度</span>
          <input
            type="number"
            v-model.number="canvasHeight"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">网格</span>
          <select
            v-model="canvasStore.grid.size"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          >
            <option :value="10">10 px</option>
            <option :value="20">20 px</option>
            <option :value="40">40 px</option>
          </select>
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">参考线</span>
          <select
            v-model="canvasStore.ruler.show"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          >
            <option :value="true">开启</option>
            <option :value="false">关闭</option>
          </select>
        </label>
      </div>
    </Panel>

    <!-- 元素属性面板 -->
    <Panel title="元素属性" :subtitle="selectedNode ? selectedNode.label : '未选择'">
      <template #actions>
        <Button variant="ghost" size="sm" @click="clearSelection" :disabled="!selectedNode">
          清除
        </Button>
      </template>

      <div class="property-grid grid grid-cols-2 gap-2">
        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">名称</span>
          <input
            type="text"
            v-model="nodeLabel"
            :placeholder="selectedNode ? '' : '-'"
            :disabled="!selectedNode"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none dark:bg-card disabled:bg-muted disabled:text-muted-foreground"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">类型</span>
          <input
            type="text"
            :value="selectedNode ? getNodeTypeName(selectedNode.type) : ''"
            disabled
            class="h-7 w-full rounded-sm border border-input bg-muted px-1.5 text-[13px] text-muted-foreground"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">X</span>
          <input
            type="number"
            v-model.number="nodeX"
            :placeholder="selectedNode ? '' : '-'"
            :disabled="!selectedNode"
            @blur="snapNodePosition"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card disabled:bg-muted disabled:text-muted-foreground"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">Y</span>
          <input
            type="number"
            v-model.number="nodeY"
            :placeholder="selectedNode ? '' : '-'"
            :disabled="!selectedNode"
            @blur="snapNodePosition"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card disabled:bg-muted disabled:text-muted-foreground"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">宽</span>
          <input
            type="number"
            v-model.number="nodeWidth"
            :placeholder="selectedNode ? '' : '-'"
            :disabled="!selectedNode"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card disabled:bg-muted disabled:text-muted-foreground"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">高</span>
          <input
            type="number"
            v-model.number="nodeHeight"
            :placeholder="selectedNode ? '' : '-'"
            :disabled="!selectedNode"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card disabled:bg-muted disabled:text-muted-foreground"
          />
        </label>
      </div>
    </Panel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import Panel from '@/components/common/Panel.vue'
import { Button } from '@/components/ui/button'

const canvasStore = useCanvasStore()

// 获取当前选中的节点（只支持单选）
const selectedNode = computed(() => {
  if (canvasStore.selectedNodeIds.length === 1) {
    return canvasStore.nodes.find(n => n.id === canvasStore.selectedNodeIds[0])
  }
  return null
})

// 获取节点类型名称
const getNodeTypeName = (type: number): string => {
  const typeMap: Record<number, string> = {
    1: '工位',
    2: '人工工位',
    3: '充电站',
    4: '机械手',
    5: '门',
    6: '停靠区',
    7: '路径点',
    12: '货架',
  }
  return typeMap[type] || '未知'
}

// 使用 computed 创建双向绑定的属性
const canvasWidth = computed({
  get: () => canvasStore.canvasWidth,
  set: (value: number) => {
    if (!isNaN(value) && value > 0) {
      canvasStore.canvasWidth = value
    }
  },
})

const canvasHeight = computed({
  get: () => canvasStore.canvasHeight,
  set: (value: number) => {
    if (!isNaN(value) && value > 0) {
      canvasStore.canvasHeight = value
    }
  },
})

const nodeLabel = computed({
  get: () => selectedNode.value?.label || '',
  set: (value: string) => {
    if (selectedNode.value) {
      canvasStore.updateNode(selectedNode.value.id, { label: value })
    }
  },
})

const nodeX = computed({
  get: () => selectedNode.value?.x ?? 0,
  set: (value: number) => {
    if (selectedNode.value && !isNaN(value)) {
      canvasStore.updateNode(selectedNode.value.id, { x: value })
    }
  },
})

const nodeY = computed({
  get: () => selectedNode.value?.y ?? 0,
  set: (value: number) => {
    if (selectedNode.value && !isNaN(value)) {
      canvasStore.updateNode(selectedNode.value.id, { y: value })
    }
  },
})

const nodeWidth = computed({
  get: () => selectedNode.value?.width ?? 0,
  set: (value: number) => {
    if (selectedNode.value && !isNaN(value) && value > 0) {
      canvasStore.updateNode(selectedNode.value.id, { width: value })
    }
  },
})

const nodeHeight = computed({
  get: () => selectedNode.value?.height ?? 0,
  set: (value: number) => {
    if (selectedNode.value && !isNaN(value) && value > 0) {
      canvasStore.updateNode(selectedNode.value.id, { height: value })
    }
  },
})

// 失焦时吸附到网格
const snapNodePosition = () => {
  if (!selectedNode.value) return
  const snappedPos = canvasStore.snapToGridPoint(selectedNode.value.x, selectedNode.value.y)
  canvasStore.updateNode(selectedNode.value.id, {
    x: snappedPos.x,
    y: snappedPos.y,
  })
}

// 清除选择
const clearSelection = () => {
  canvasStore.clearSelection()
}
</script>
