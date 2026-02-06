import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  CanvasNode,
  NodeData,
  CanvasPath,
  CanvasPathLine,
  PathData,
  GridConfig,
  RulerConfig,
  CanvasViewport,
  ToolType,
} from '@/types'
import { createNode, importNodes, exportNodes } from '@/utils/nodeTransform'
import { createPath, importPaths, exportPaths, calculateDistance } from '@/utils/pathTransform'

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
  const pathLines = ref<CanvasPathLine[]>([]) // 路径线列表
  const paths = ref<CanvasPath[]>([]) // 旧的路径数据（保留兼容）
  
  // 选中状态管理
  type SelectionType = 'node' | 'path' | null
  const selectedType = ref<SelectionType>(null)
  const selectedNodeIds = ref<string[]>([]) // 节点选中（支持多选）
  const selectedPathId = ref<string | null>(null) // 路径线选中（单选）

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
      
      // 如果更新了位置，自动更新相关路径的距离
      if (updates.x !== undefined || updates.y !== undefined) {
        updatePathDistances(id)
      }
    }
  }

  const deleteNode = (id: string) => {
    nodes.value = nodes.value.filter(n => n.id !== id)
    selectedNodeIds.value = selectedNodeIds.value.filter(sid => sid !== id)
  }

  const deleteSelectedNodes = () => {
    nodes.value = nodes.value.filter(n => !selectedNodeIds.value.includes(n.id))
    selectedNodeIds.value = []
  }

  // 选中管理方法
  const selectNode = (id: string, multi = false) => {
    selectedType.value = 'node'
    selectedPathId.value = null // 清除路径选中
    
    if (multi) {
      const index = selectedNodeIds.value.indexOf(id)
      if (index !== -1) {
        selectedNodeIds.value.splice(index, 1)
      } else {
        selectedNodeIds.value.push(id)
      }
    } else {
      selectedNodeIds.value = [id]
    }
  }

  const clearSelection = () => {
    selectedType.value = null
    selectedNodeIds.value = []
    selectedPathId.value = null
  }

  // 选中路径线（单选）
  const selectPath = (id: string) => {
    selectedType.value = 'path'
    selectedNodeIds.value = [] // 清除节点选中
    selectedPathId.value = id
  }

  // 获取当前选中的对象
  const getSelectedObject = computed(() => {
    if (selectedType.value === 'node' && selectedNodeIds.value.length > 0) {
      return {
        type: 'node' as const,
        nodes: nodes.value.filter(n => selectedNodeIds.value.includes(n.id)),
      }
    }
    if (selectedType.value === 'path' && selectedPathId.value) {
      return {
        type: 'path' as const,
        path: pathLines.value.find(p => p.id === selectedPathId.value),
      }
    }
    return null
  })

  // 路径线管理方法
  const addPathLine = (path: CanvasPathLine) => {
    pathLines.value.push(path)
  }

  // 通过表单数据创建路径线
  const addPathFromData = (pathData: Omit<PathData, 'type' | 'distance'>) => {
    // 查找起始和结束节点
    const startNode = nodes.value.find(n => n.node === pathData.startNode)
    const endNode = nodes.value.find(n => n.node === pathData.endNode)

    if (!startNode || !endNode) {
      throw new Error('起始节点或结束节点不存在')
    }

    // 创建路径线
    const path = createPath(pathData, startNode.x, startNode.y, endNode.x, endNode.y)
    pathLines.value.push(path)
    return path
  }

  // 更新路径线
  const updatePathLine = (id: string, updates: Partial<CanvasPathLine>) => {
    const index = pathLines.value.findIndex(p => p.id === id)
    if (index !== -1) {
      pathLines.value[index] = { ...pathLines.value[index], ...updates }
    }
  }

  // 删除路径线
  const deletePathLine = (id: string) => {
    pathLines.value = pathLines.value.filter(p => p.id !== id)
    if (selectedPathId.value === id) {
      clearSelection()
    }
  }

  // 节点移动时更新相关路径线的距离
  const updatePathDistances = (nodeId: string) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node) return

    // 查找所有连接到该节点的路径线
    const relatedPaths = pathLines.value.filter(
      p => p.startNode === node.node || p.endNode === node.node
    )

    relatedPaths.forEach(path => {
      const startNode = nodes.value.find(n => n.node === path.startNode)
      const endNode = nodes.value.find(n => n.node === path.endNode)

      if (startNode && endNode) {
        const newDistance = calculateDistance(startNode.x, startNode.y, endNode.x, endNode.y)
        updatePathLine(path.id, { distance: newDistance })
      }
    })
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
    clearSelection()
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
    pathLines,
    selectedType,
    selectedNodeIds,
    selectedPathId,
    currentTool,
    isDragging,
    isDrawingPath,
    currentPathPoints,

    // 计算属性
    gridBaseSize,
    rulerInterval,
    getSelectedObject,

    // 节点方法
    addNode,
    addNodeFromData,
    updateNode,
    deleteNode,
    deleteSelectedNodes,
    
    // 选中方法
    selectNode,
    selectPath,
    clearSelection,
    
    // 路径线方法
    addPathLine,
    addPathFromData,
    updatePathLine,
    deletePathLine,
    updatePathDistances,
    
    // 旧路径方法（保留兼容）
    addPath,
    startPath,
    addPathPoint,
    finishPath,
    cancelPath,
    
    // 视口方法
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
