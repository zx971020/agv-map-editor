import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  CanvasNode,
  NodeData,
  CanvasPath,
  GridConfig,
  RulerConfig,
  CanvasViewport,
  ToolType,
} from '@/types'
import { createNode, importNodes, exportNodes } from '@/utils/nodeTransform'

export const useCanvasStore = defineStore('canvas', () => {
  // 画布逻辑尺寸（实际地图尺寸，最大支持 100000x100000）
  const canvasWidth = ref(100000)
  const canvasHeight = ref(100000)

  // 视口配置（用于无极缩放和平移）
  const viewport = ref<CanvasViewport>({
    x: 0,
    y: 0,
    scale: 1,
  })

  // 网格配置
  const grid = ref<GridConfig>({
    show: true,
    size: 20,
    snapToGrid: true,
    snapThreshold: 5,
  })

  // 标尺配置
  const ruler = ref<RulerConfig>({
    show: false,
    size: 30,
    interval: 100,
  })

  // 生成测试节点（使用新的类型系统）
  const generateTestNodes = (): CanvasNode[] => {
    const types = [1, 2, 3, 4, 5, 6, 7, 12]

    const testNodeData: NodeData[] = []
    for (let i = 0; i < 1000; i++) {
      const typeIndex = i % types.length
      testNodeData.push({
        node: i,
        type: types[typeIndex],
        x: Math.random() * 50000,
        y: Math.random() * 50000,
        leftStation: 0,
        rightStation: 0,
        nodeAttr: 'COMMON',
        nodeType: typeIndex < 6 ? 'LOAD' : 'PATH',
        navigationMode: 0,
        avoidable: 1,
        enable:true,
        speed:100,
        dir:20,
        regionName:'',
        stationName:'',
        floor:1
      })
    }

    // 使用 importNodes 转换为运行时数据
    return importNodes(testNodeData)
  }

  // 元素管理（笛卡尔坐标）
  const nodes = ref<CanvasNode[]>(generateTestNodes())
  const paths = ref<CanvasPath[]>([])
  const selectedIds = ref<string[]>([])

  // 工具状态
  const currentTool = ref<ToolType>('select')
  const isDragging = ref(false)
  const isDrawingPath = ref(false)
  const currentPathPoints = ref<number[]>([])

  // 计算属性：根据缩放比例获取合适的网格基准大小
  const gridBaseSize = computed(() => {
    const scale = viewport.value.scale
    if (scale < 0.75) return 40
    if (scale < 1.5) return 20
    return 10
  })

  // 计算属性：根据缩放比例获取合适的标尺刻度间隔
  const rulerInterval = computed(() => {
    const scale = viewport.value.scale
    if (scale < 0.5) return 200
    if (scale < 1) return 100
    if (scale < 2) return 50
    return 25
  })

  // 节点管理方法
  const addNode = (node: CanvasNode) => {
    nodes.value.push(node)
  }

  // 通过部分数据创建并添加节点
  const addNodeFromData = (partialData: Pick<NodeData, 'type' | 'x' | 'y'> & Partial<NodeData>) => {
    const node = createNode(partialData)
    nodes.value.push(node)
    return node
  }

  const updateNode = (id: string, updates: Partial<CanvasNode>) => {
    const index = nodes.value.findIndex(n => n.id === id)
    if (index !== -1) {
      nodes.value[index] = { ...nodes.value[index], ...updates }
    }
  }

  const deleteNode = (id: string) => {
    nodes.value = nodes.value.filter(n => n.id !== id)
    selectedIds.value = selectedIds.value.filter(sid => sid !== id)
  }

  const deleteSelectedNodes = () => {
    nodes.value = nodes.value.filter(n => !selectedIds.value.includes(n.id))
    selectedIds.value = []
  }

  // 选中管理方法
  const selectNode = (id: string, multi = false) => {
    if (multi) {
      const index = selectedIds.value.indexOf(id)
      if (index !== -1) {
        selectedIds.value.splice(index, 1)
      } else {
        selectedIds.value.push(id)
      }
    } else {
      selectedIds.value = [id]
    }
  }

  const clearSelection = () => {
    selectedIds.value = []
  }

  // 路径管理方法
  const addPath = (path: CanvasPath) => {
    paths.value.push(path)
  }

  const startPath = () => {
    isDrawingPath.value = true
    currentPathPoints.value = []
  }

  const addPathPoint = (x: number, y: number) => {
    currentPathPoints.value.push(x, y)
  }

  const finishPath = () => {
    if (currentPathPoints.value.length >= 4) {
      const path: CanvasPath = {
        id: `path_${Date.now()}`,
        points: [...currentPathPoints.value],
        style: {
          stroke: '#0066cc',
          strokeWidth: 2,
          arrow: true,
        },
      }
      addPath(path)
    }
    isDrawingPath.value = false
    currentPathPoints.value = []
  }

  const cancelPath = () => {
    isDrawingPath.value = false
    currentPathPoints.value = []
  }

  // 视口控制方法
  const setViewport = (updates: Partial<CanvasViewport>) => {
    viewport.value = { ...viewport.value, ...updates }
  }

  const zoomIn = () => {
    const newScale = Math.min(viewport.value.scale * 1.2, 5)
    viewport.value.scale = newScale
  }

  const zoomOut = () => {
    const newScale = Math.max(viewport.value.scale / 1.2, 0.1)
    viewport.value.scale = newScale
  }

  const resetViewport = () => {
    viewport.value = { x: 0, y: 0, scale: 1 }
  }

  // 工具切换
  const setTool = (tool: ToolType) => {
    currentTool.value = tool
    if (tool !== 'path') {
      cancelPath()
    }
  }

  // 网格吸附
  const snapToGridPoint = (x: number, y: number): { x: number; y: number } => {
    if (!grid.value.snapToGrid) {
      return { x, y }
    }
    const gridSize = grid.value.size
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    }
  }

  // 导入导出方法
  const loadNodes = (data: NodeData[]) => {
    nodes.value = importNodes(data)
    selectedIds.value = []
  }

  const getExportData = (): NodeData[] => {
    return exportNodes(nodes.value)
  }

  return {
    // 状态
    canvasWidth,
    canvasHeight,
    viewport,
    grid,
    ruler,
    nodes,
    paths,
    selectedIds,
    currentTool,
    isDragging,
    isDrawingPath,
    currentPathPoints,

    // 计算属性
    gridBaseSize,
    rulerInterval,

    // 方法
    addNode,
    addNodeFromData,
    updateNode,
    deleteNode,
    deleteSelectedNodes,
    selectNode,
    clearSelection,
    addPath,
    startPath,
    addPathPoint,
    finishPath,
    cancelPath,
    setViewport,
    zoomIn,
    zoomOut,
    resetViewport,
    setTool,
    snapToGridPoint,

    // 导入导出
    loadNodes,
    getExportData,
  }
})
