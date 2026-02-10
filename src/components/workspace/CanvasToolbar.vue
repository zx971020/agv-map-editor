<template>
  <div class="flex items-center justify-between h-12 px-4 toolbar-modern">
    <!-- 左侧工具组 -->
    <div class="flex items-center gap-1">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all rounded-lg"
        :class="
          tool.id === activeTool
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        "
        :title="tool.tooltip"
        @click="activeTool = tool.id"
      >
        <component :is="tool.icon" class="w-4 h-4" />
        <span>{{ tool.label }}</span>
      </button>
    </div>

    <!-- 中间工具组 -->
    <div class="flex items-center gap-1">
      <el-button
        text
        circle
        size="small"
        :title="canvasStore.grid.show ? '隐藏网格 (G)' : '显示网格 (G)'"
        :class="{ 'bg-accent text-accent-foreground': canvasStore.grid.show }"
        @click="toggleGrid"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
          />
        </svg>
      </el-button>

      <el-button
        text
        circle
        size="small"
        :title="canvasStore.grid.snapToGrid ? '关闭网格吸附 (Shift+G)' : '开启网格吸附 (Shift+G)'"
        :class="{ 'bg-accent text-accent-foreground': canvasStore.grid.snapToGrid }"
        @click="toggleSnapToGrid"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      </el-button>
    </div>

    <!-- 右侧操作按钮组 -->
    <div class="flex items-center gap-2">
      <el-button text size="small">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
          />
        </svg>
        撤销
      </el-button>
      <el-button text size="small">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
          />
        </svg>
        重做
      </el-button>

      <div class="w-px h-6 bg-border"></div>

      <el-button type="primary" size="small" @click="openPathDialog">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        创建路径
      </el-button>

      <div class="w-px h-6 bg-border"></div>

      <el-button text size="small">保存</el-button>
      <el-button size="small">导出</el-button>
      <el-button type="danger" size="small">删除</el-button>

      <div class="w-px h-6 bg-border"></div>

      <!-- 性能测试按钮 -->
      <el-button type="info" size="small" @click="generateTestLines">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
          />
        </svg>
        生成500条线
      </el-button>
      <el-button text size="small" @click="clearTestLines">清空连接线</el-button>
    </div>

    <!-- 路径表单对话框 -->
    <PathFormDialog v-model:open="isPathDialogOpen" @success="handlePathCreated" />
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import PathFormDialog from '@/components/dialogs/PathFormDialog.vue'
import { useCanvasStore } from '@/stores/canvasStore'

const canvasStore = useCanvasStore()

// 路径对话框状态
const isPathDialogOpen = ref(false)

// 打开路径对话框
const openPathDialog = () => {
  isPathDialogOpen.value = true
}

// 路径创建成功回调
const handlePathCreated = () => {
  console.log('路径创建成功')
}

// 生成测试连接线
const generateTestLines = () => {
  console.log('开始生成500根测试连接线...')
  const startTime = performance.now()

  canvasStore.loadTestPathLines(500)

  const endTime = performance.now()
  console.log(`生成完成，耗时: ${(endTime - startTime).toFixed(2)}ms`)
  console.log(`当前连接线数量: ${canvasStore.pathLines.length}`)
}

// 清空测试连接线
const clearTestLines = () => {
  console.log('清空所有连接线...')
  canvasStore.clearAllPathLines()
  console.log('清空完成')
}

// 工具图标组件
const SelectIcon = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '1.5',
      stroke: 'currentColor',
    },
    [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59',
      }),
    ]
  )

const PathIcon = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '1.5',
      stroke: 'currentColor',
    },
    [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z',
      }),
    ]
  )

const AreaIcon = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '1.5',
      stroke: 'currentColor',
    },
    [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z',
      }),
    ]
  )

// 工具列表
const tools = [
  { id: 'select', label: '选择', tooltip: '选择工具 (V)', icon: SelectIcon },
  { id: 'path', label: '路径', tooltip: '路径工具 (P)', icon: PathIcon },
  { id: 'area', label: '区域', tooltip: '区域工具 (R)', icon: AreaIcon },
]

// 当前激活的工具
const activeTool = ref('select')

// 切换网格显示
const toggleGrid = () => {
  canvasStore.grid.show = !canvasStore.grid.show
}

// 切换网格吸附
const toggleSnapToGrid = () => {
  canvasStore.grid.snapToGrid = !canvasStore.grid.snapToGrid
}
</script>
