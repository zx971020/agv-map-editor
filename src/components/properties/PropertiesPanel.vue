<template>
  <div class="flex flex-col gap-2">
    <!-- 地图属性面板 -->
    <Panel title="地图属性" subtitle="基础尺寸">
      <div class="grid grid-cols-2 gap-2 property-grid">
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
      </div>
    </Panel>

    <!-- 节点属性面板 -->
    <Panel
      v-if="canvasStore.selectedType === 'node'"
      title="节点属性"
      :subtitle="selectedNode ? `节点 ${selectedNode.node}` : '未选择'"
    >
      <template #actions>
        <el-button text size="small" @click="clearSelection" :disabled="!selectedNode">
          清除
        </el-button>
      </template>

      <div v-if="selectedNode" class="grid grid-cols-2 gap-2 property-grid">
        <!-- 基础属性 -->
        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">节点编号</span>
          <input
            type="number"
            v-model.number="nodeNumber"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">类型</span>
          <input
            type="text"
            :value="getNodeTypeName(selectedNode.type)"
            disabled
            class="h-7 w-full rounded-sm border border-input bg-muted px-1.5 text-[13px] text-muted-foreground"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">X 坐标</span>
          <input
            type="number"
            v-model.number="nodeX"
            @blur="snapNodePosition"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">Y 坐标</span>
          <input
            type="number"
            v-model.number="nodeY"
            @blur="snapNodePosition"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <!-- 工位属性 -->
        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">LeftStation</span>
          <input
            type="number"
            v-model.number="nodeLeftStation"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">RightStation</span>
          <input
            v-model="nodeRightStation"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <!-- 节点属性 -->
        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">节点属性</span>
          <select
            v-model="nodeAttr"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          >
            <option v-for="option in dictData.nodeAttr" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">节点类型</span>
          <select
            v-model="nodeType"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          >
            <option v-for="option in dict.nodeType" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <!-- 导航模式 -->
        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">导航模式</span>
          <select
            v-model.number="nodeNavigationMode"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          >
            <option v-for="option in dict.navigationMode" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">可避让</span>
          <select
            v-model.number="nodeAvoidable"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          >
            <option :value="1">是</option>
            <option :value="0">否</option>
          </select>
        </label>

        <!-- 速度和方向 -->
        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">速度</span>
          <input
            type="number"
            v-model.number="nodeSpeed"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">节点方向</span>
          <select
            v-model.number="nodeDir"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          >
            <option v-for="option in dict.nodeDirection" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <!-- 使能 -->
        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">充电点使能</span>
          <select
            v-model="nodeEnable"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          >
            <option :value="true">启用</option>
            <option :value="false">禁用</option>
          </select>
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">楼层</span>
          <input
            type="text"
            v-model="nodeFloor"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <!-- 区域和站点 -->
        <label class="property-item flex flex-col gap-0.5 col-span-2">
          <span class="text-xs text-dim">区域名称</span>
          <input
            type="text"
            v-model="nodeRegionName"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5 col-span-2">
          <span class="text-xs text-dim">站点名称</span>
          <input
            type="text"
            v-model="nodeStationName"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>
      </div>

      <div v-else class="py-4 text-sm text-center text-muted-foreground">未选择节点</div>
    </Panel>

    <!-- 路径线属性面板 -->
    <Panel
      v-if="canvasStore.selectedType === 'path'"
      title="路径线属性"
      :subtitle="
        selectedPath ? `路径 ${selectedPath.startNode} → ${selectedPath.endNode}` : '未选择'
      "
    >
      <template #actions>
        <el-button text size="small" @click="clearSelection" :disabled="!selectedPath">
          清除
        </el-button>
      </template>

      <div v-if="selectedPath" class="grid grid-cols-2 gap-2 property-grid">
        <!-- 节点信息（只读） -->
        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">起始节点</span>
          <input
            type="number"
            :value="selectedPath.startNode"
            disabled
            class="h-7 w-full rounded-sm border border-input bg-muted px-1.5 text-[13px] text-muted-foreground"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">结束节点</span>
          <input
            type="number"
            :value="selectedPath.endNode"
            disabled
            class="h-7 w-full rounded-sm border border-input bg-muted px-1.5 text-[13px] text-muted-foreground"
          />
        </label>

        <!-- 线型 -->
        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">线型</span>
          <select
            v-model.number="pathLineType"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          >
            <option v-for="option in dict.lineType" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">距离</span>
          <input
            type="number"
            :value="selectedPath.distance.toFixed(0)"
            disabled
            class="h-7 w-full rounded-sm border border-input bg-muted px-1.5 text-[13px] text-muted-foreground"
          />
        </label>

        <!-- 控制点（仅弧线） -->
        <template v-if="selectedPath.lineType === 1">
          <label class="property-item flex flex-col gap-0.5">
            <span class="text-xs text-dim">控制点 X</span>
            <input
              type="number"
              v-model.number="pathCpx"
              class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
            />
          </label>

          <label class="property-item flex flex-col gap-0.5">
            <span class="text-xs text-dim">控制点 Y</span>
            <input
              type="number"
              v-model.number="pathCpy"
              class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
            />
          </label>
        </template>

        <!-- 车道方向 -->
        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">车道方向</span>
          <select
            v-model.number="pathLaneDir"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          >
            <option v-for="option in dict.lineDirection" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">速度限制</span>
          <input
            type="number"
            v-model.number="pathSpeed"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <!-- 航向角 -->
        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">正向航向角</span>
          <input
            type="number"
            v-model.number="pathPositiveCourse"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">反向航向角</span>
          <input
            type="number"
            v-model.number="pathNegativeCourse"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <!-- 车体航向角 -->
        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">车体正向航向角</span>
          <input
            type="number"
            v-model.number="pathCarBodyPositiveCourse"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">车体反向航向角</span>
          <input
            type="number"
            v-model.number="pathCarBodyNegativeCourse"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>
      </div>

      <div v-else class="py-4 text-sm text-center text-muted-foreground">未选择路径线</div>
    </Panel>

    <!-- 无选中状态 -->
    <Panel v-if="!canvasStore.selectedType" title="元素属性" subtitle="未选择">
      <div class="py-4 text-sm text-center text-muted-foreground">请选择节点或路径线以编辑属性</div>
    </Panel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import Panel from '@/components/common/Panel.vue'
import dictData from '@/assets/dict.json'

const canvasStore = useCanvasStore()

// 字典数据
const dict = dictData as {
  lineDirection: Array<{ label: string; value: number }>
  nodeDirection: Array<{ label: string; value: number }>
  navigationMode: Array<{ label: string; value: number }>
  lineType: Array<{ label: string; value: number }>
  nodeAttr: Array<{ label: string; value: string }>
  nodeType: Array<{ label: string; value: string }>
}

// 获取当前选中的节点（只支持单选）
const selectedNode = computed(() => {
  if (canvasStore.selectedType === 'node' && canvasStore.selectedNodeIds.length === 1) {
    return canvasStore.nodes.find(n => n.id === canvasStore.selectedNodeIds[0])
  }
  return null
})

// 获取当前选中的路径线
const selectedPath = computed(() => {
  if (canvasStore.selectedType === 'path' && canvasStore.selectedPathId) {
    return canvasStore.pathLines.find(p => p.id === canvasStore.selectedPathId)
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

// ==================== 地图属性 ====================
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

// ==================== 节点属性 ====================
const nodeNumber = computed({
  get: () => selectedNode.value?.node ?? 0,
  set: (value: number | string) => {
    if (!selectedNode.value) return

    const newNodeNumber = typeof value === 'number' ? value : parseInt(String(value), 10)

    // 校验：检查是否存在相同编号的其他节点
    const existingNode = canvasStore.nodes.find(
      n => n.id !== selectedNode.value!.id && n.node === newNodeNumber
    )

    if (existingNode) {
      // 存在相同编号，不允许修改
      alert(`节点编号 ${newNodeNumber} 已存在，请使用其他编号！`)
      // 恢复原值（触发重新渲染）
      const currentValue = selectedNode.value.node
      canvasStore.updateNode(selectedNode.value.id, { node: currentValue })
      return
    }

    // 不存在相同编号，允许修改
    canvasStore.updateNode(selectedNode.value.id, { node: newNodeNumber })
  },
})

const nodeX = computed({
  get: () => selectedNode.value?.x ?? 0,
  set: (value: number) => {
    if (selectedNode.value && !isNaN(value)) {
      canvasStore.updateNode(selectedNode.value.id, { x: Math.round(value) })
    }
  },
})

const nodeY = computed({
  get: () => selectedNode.value?.y ?? 0,
  set: (value: number) => {
    if (selectedNode.value && !isNaN(value)) {
      canvasStore.updateNode(selectedNode.value.id, { y: Math.round(value) })
    }
  },
})

const nodeLeftStation = computed({
  get: () => selectedNode.value?.leftStation ?? 0,
  set: (value: number) => {
    if (selectedNode.value && !isNaN(value)) {
      canvasStore.updateNode(selectedNode.value.id, { leftStation: value })
    }
  },
})

const nodeRightStation = computed({
  get: () => selectedNode.value?.rightStation ?? 0,
  set: (value: number) => {
    if (selectedNode.value && !isNaN(value)) {
      canvasStore.updateNode(selectedNode.value.id, { rightStation: value })
    }
  },
})

const nodeAttr = computed({
  get: () => selectedNode.value?.nodeAttr ?? 'COMMON',
  set: (value: string) => {
    if (selectedNode.value) {
      canvasStore.updateNode(selectedNode.value.id, { nodeAttr: value })
    }
  },
})

const nodeType = computed({
  get: () => selectedNode.value?.nodeType ?? 'PATH',
  set: (value: string) => {
    if (selectedNode.value) {
      canvasStore.updateNode(selectedNode.value.id, { nodeType: value })
    }
  },
})

const nodeNavigationMode = computed({
  get: () => selectedNode.value?.navigationMode ?? 0,
  set: (value: number) => {
    if (selectedNode.value && !isNaN(value)) {
      canvasStore.updateNode(selectedNode.value.id, { navigationMode: value })
    }
  },
})

const nodeAvoidable = computed({
  get: () => selectedNode.value?.avoidable ?? 1,
  set: (value: 0 | 1) => {
    if (selectedNode.value) {
      canvasStore.updateNode(selectedNode.value.id, { avoidable: value })
    }
  },
})

const nodeEnable = computed({
  get: () => selectedNode.value?.enable ?? true,
  set: (value: boolean) => {
    if (selectedNode.value) {
      canvasStore.updateNode(selectedNode.value.id, { enable: value })
    }
  },
})

const nodeSpeed = computed({
  get: () => selectedNode.value?.speed ?? 100,
  set: (value: number) => {
    if (selectedNode.value && !isNaN(value)) {
      canvasStore.updateNode(selectedNode.value.id, { speed: value })
    }
  },
})

const nodeDir = computed({
  get: () => selectedNode.value?.dir ?? 0,
  set: (value: number) => {
    if (selectedNode.value && !isNaN(value)) {
      canvasStore.updateNode(selectedNode.value.id, { dir: value })
    }
  },
})

const nodeFloor = computed({
  get: () => selectedNode.value?.floor ?? 1,
  set: (value: number | string) => {
    if (selectedNode.value) {
      canvasStore.updateNode(selectedNode.value.id, { floor: value })
    }
  },
})

const nodeRegionName = computed({
  get: () => selectedNode.value?.regionName ?? '',
  set: (value: string) => {
    if (selectedNode.value) {
      canvasStore.updateNode(selectedNode.value.id, { regionName: value })
    }
  },
})

const nodeStationName = computed({
  get: () => selectedNode.value?.stationName ?? '',
  set: (value: string) => {
    if (selectedNode.value) {
      canvasStore.updateNode(selectedNode.value.id, { stationName: value })
    }
  },
})

// ==================== 路径线属性 ====================
const pathLineType = computed({
  get: () => selectedPath.value?.lineType ?? 0,
  set: (value: number) => {
    if (selectedPath.value && !isNaN(value)) {
      canvasStore.updatePathLine(selectedPath.value.id, { lineType: value })
    }
  },
})

const pathCpx = computed({
  get: () => selectedPath.value?.cpx ?? 0,
  set: (value: number) => {
    if (selectedPath.value && !isNaN(value)) {
      canvasStore.updatePathLine(selectedPath.value.id, { cpx: value })
    }
  },
})

const pathCpy = computed({
  get: () => selectedPath.value?.cpy ?? 0,
  set: (value: number) => {
    if (selectedPath.value && !isNaN(value)) {
      canvasStore.updatePathLine(selectedPath.value.id, { cpy: value })
    }
  },
})

const pathLaneDir = computed({
  get: () => selectedPath.value?.laneDir ?? 0,
  set: (value: number) => {
    if (selectedPath.value && !isNaN(value)) {
      canvasStore.updatePathLine(selectedPath.value.id, { laneDir: value })
    }
  },
})

const pathSpeed = computed({
  get: () => selectedPath.value?.speed ?? 100,
  set: (value: number) => {
    if (selectedPath.value && !isNaN(value)) {
      canvasStore.updatePathLine(selectedPath.value.id, { speed: value })
    }
  },
})

const pathPositiveCourse = computed({
  get: () => selectedPath.value?.positiveCourse ?? 0,
  set: (value: number) => {
    if (selectedPath.value && !isNaN(value)) {
      canvasStore.updatePathLine(selectedPath.value.id, { positiveCourse: value })
    }
  },
})

const pathNegativeCourse = computed({
  get: () => selectedPath.value?.negativeCourse ?? 0,
  set: (value: number) => {
    if (selectedPath.value && !isNaN(value)) {
      canvasStore.updatePathLine(selectedPath.value.id, { negativeCourse: value })
    }
  },
})

const pathCarBodyPositiveCourse = computed({
  get: () => selectedPath.value?.carBodyPositiveCourse ?? 0,
  set: (value: number) => {
    if (selectedPath.value && !isNaN(value)) {
      canvasStore.updatePathLine(selectedPath.value.id, { carBodyPositiveCourse: value })
    }
  },
})

const pathCarBodyNegativeCourse = computed({
  get: () => selectedPath.value?.carBodyNegativeCourse ?? 0,
  set: (value: number) => {
    if (selectedPath.value && !isNaN(value)) {
      canvasStore.updatePathLine(selectedPath.value.id, { carBodyNegativeCourse: value })
    }
  },
})

// ==================== 工具方法 ====================
// 失焦时吸附到网格
const snapNodePosition = () => {
  if (!selectedNode.value) return
  const snappedPos = canvasStore.snapToGridPoint(selectedNode.value.x, selectedNode.value.y)
  canvasStore.updateNode(selectedNode.value.id, {
    x: Math.round(snappedPos.x),
    y: Math.round(snappedPos.y),
  })
}

// 清除选择
const clearSelection = () => {
  canvasStore.clearSelection()
}
</script>
