import { setActivePinia, createPinia } from 'pinia'
import { useCanvasStore } from '@/stores/canvasStore'
import type { CanvasNode, CanvasPathLine } from '@/types'

// 工厂函数
function makeNode(overrides: Partial<CanvasNode> = {}): CanvasNode {
  return {
    id: `node-${Math.random().toString(36).slice(2, 7)}`,
    node: 1,
    type: 1,
    x: 100,
    y: 200,
    leftStation: 0,
    rightStation: '',
    nodeAttr: 'COMMON',
    nodeType: 'LOAD',
    navigationMode: 0,
    avoidable: 1,
    enable: false,
    speed: 1000,
    dir: 0,
    floor: 1,
    regionName: '',
    stationName: '',
    width: 50,
    height: 50,
    rotation: 0,
    label: '工位',
    ...overrides,
  }
}

function makePathLine(overrides: Partial<CanvasPathLine> = {}): CanvasPathLine {
  return {
    id: `path-${Math.random().toString(36).slice(2, 7)}`,
    type: 11,
    startNode: 1,
    endNode: 2,
    lineType: 0,
    distance: 100,
    laneDir: 0,
    speed: 100,
    positiveCourse: 0,
    negativeCourse: 180,
    carBodyPositiveCourse: 0,
    carBodyNegativeCourse: 180,
    strokeColor: '#10b981',
    strokeWidth: 2,
    showArrow: true,
    ...overrides,
  }
}

describe('canvasStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('初始状态', () => {
    it('画布尺寸默认 100000x100000', () => {
      const store = useCanvasStore()
      expect(store.canvasWidth).toBe(100000)
      expect(store.canvasHeight).toBe(100000)
    })

    it('视口默认原点、缩放 1', () => {
      const store = useCanvasStore()
      expect(store.viewport).toEqual({ x: 0, y: 0, scale: 1 })
    })

    it('网格默认配置', () => {
      const store = useCanvasStore()
      expect(store.grid.show).toBe(true)
      expect(store.grid.size).toBe(20)
      expect(store.grid.snapToGrid).toBe(false)
      expect(store.grid.snapThreshold).toBe(5)
    })

    it('节点和路径列表为空', () => {
      const store = useCanvasStore()
      expect(store.nodes).toEqual([])
      expect(store.pathLines).toEqual([])
      expect(store.paths).toEqual([])
    })

    it('无选中状态', () => {
      const store = useCanvasStore()
      expect(store.selectedType).toBeNull()
      expect(store.selectedNodeIds).toEqual([])
      expect(store.selectedPathId).toBeNull()
    })

    it('默认工具为 select', () => {
      const store = useCanvasStore()
      expect(store.currentTool).toBe('select')
    })
  })

  describe('节点管理', () => {
    it('addNode 添加节点', () => {
      const store = useCanvasStore()
      const node = makeNode({ id: 'n1', node: 1 })
      store.addNode(node)
      expect(store.nodes).toHaveLength(1)
      expect(store.nodes[0].id).toBe('n1')
    })

    it('addNodeFromData 创建并添加节点', () => {
      const store = useCanvasStore()
      const node = store.addNodeFromData({ type: 3, x: 100, y: 200 })
      expect(store.nodes).toHaveLength(1)
      expect(node.type).toBe(3)
      expect(node.x).toBe(100)
      expect(node.y).toBe(200)
      expect(node.label).toBe('充电站')
      expect(node.id).toBeDefined()
    })

    it('addNodeFromData 自动递增编号', () => {
      const store = useCanvasStore()
      store.addNode(makeNode({ node: 5 }))
      store.addNode(makeNode({ node: 10 }))
      const newNode = store.addNodeFromData({ type: 1, x: 0, y: 0 })
      expect(newNode.node).toBe(11)
    })

    it('updateNode 更新节点属性', () => {
      const store = useCanvasStore()
      store.addNode(makeNode({ id: 'n1', x: 0, y: 0 }))
      store.updateNode('n1', { x: 500, y: 600 })
      expect(store.nodes[0].x).toBe(500)
      expect(store.nodes[0].y).toBe(600)
    })

    it('updateNode 不存在的 ID 无副作用', () => {
      const store = useCanvasStore()
      store.addNode(makeNode({ id: 'n1' }))
      store.updateNode('nonexistent', { x: 999 })
      expect(store.nodes[0].x).toBe(100) // 未变
    })

    it('deleteNode 删除节点', () => {
      const store = useCanvasStore()
      store.addNode(makeNode({ id: 'n1', node: 1 }))
      store.addNode(makeNode({ id: 'n2', node: 2 }))
      store.deleteNode('n1')
      expect(store.nodes).toHaveLength(1)
      expect(store.nodes[0].id).toBe('n2')
    })

    it('deleteNode 同时删除关联路径', () => {
      const store = useCanvasStore()
      store.addNode(makeNode({ id: 'n1', node: 1 }))
      store.addNode(makeNode({ id: 'n2', node: 2 }))
      store.addNode(makeNode({ id: 'n3', node: 3 }))
      store.addPathLine(makePathLine({ id: 'p1', startNode: 1, endNode: 2 }))
      store.addPathLine(makePathLine({ id: 'p2', startNode: 2, endNode: 3 }))
      store.addPathLine(makePathLine({ id: 'p3', startNode: 1, endNode: 3 }))

      store.deleteNode('n1') // 删除 node=1，应删除 p1 和 p3
      expect(store.pathLines).toHaveLength(1)
      expect(store.pathLines[0].id).toBe('p2')
    })

    it('deleteNode 清除选中状态', () => {
      const store = useCanvasStore()
      store.addNode(makeNode({ id: 'n1' }))
      store.selectNode('n1')
      store.deleteNode('n1')
      expect(store.selectedNodeIds).not.toContain('n1')
    })

    it('deleteSelectedNodes 批量删除', () => {
      const store = useCanvasStore()
      store.addNode(makeNode({ id: 'n1', node: 1 }))
      store.addNode(makeNode({ id: 'n2', node: 2 }))
      store.addNode(makeNode({ id: 'n3', node: 3 }))
      store.addPathLine(makePathLine({ id: 'p1', startNode: 1, endNode: 2 }))

      store.selectNode('n1')
      store.selectNode('n2', true)
      store.deleteSelectedNodes()

      expect(store.nodes).toHaveLength(1)
      expect(store.nodes[0].id).toBe('n3')
      expect(store.pathLines).toHaveLength(0) // 关联路径也被删除
      expect(store.selectedNodeIds).toEqual([])
    })
  })

  describe('选中管理', () => {
    it('selectNode 单选', () => {
      const store = useCanvasStore()
      store.addNode(makeNode({ id: 'n1' }))
      store.selectNode('n1')
      expect(store.selectedType).toBe('node')
      expect(store.selectedNodeIds).toEqual(['n1'])
      expect(store.selectedPathId).toBeNull()
    })

    it('selectNode 单选替换', () => {
      const store = useCanvasStore()
      store.addNode(makeNode({ id: 'n1' }))
      store.addNode(makeNode({ id: 'n2' }))
      store.selectNode('n1')
      store.selectNode('n2')
      expect(store.selectedNodeIds).toEqual(['n2'])
    })

    it('selectNode 多选模式', () => {
      const store = useCanvasStore()
      store.addNode(makeNode({ id: 'n1' }))
      store.addNode(makeNode({ id: 'n2' }))
      store.selectNode('n1')
      store.selectNode('n2', true)
      expect(store.selectedNodeIds).toEqual(['n1', 'n2'])
    })

    it('selectNode 多选模式取消选中', () => {
      const store = useCanvasStore()
      store.addNode(makeNode({ id: 'n1' }))
      store.addNode(makeNode({ id: 'n2' }))
      store.selectNode('n1')
      store.selectNode('n2', true)
      store.selectNode('n1', true) // 取消 n1
      expect(store.selectedNodeIds).toEqual(['n2'])
    })

    it('selectPath 选中路径', () => {
      const store = useCanvasStore()
      store.addPathLine(makePathLine({ id: 'p1' }))
      store.selectPath('p1')
      expect(store.selectedType).toBe('path')
      expect(store.selectedPathId).toBe('p1')
      expect(store.selectedNodeIds).toEqual([])
    })

    it('selectNode 清除路径选中', () => {
      const store = useCanvasStore()
      store.addPathLine(makePathLine({ id: 'p1' }))
      store.selectPath('p1')
      store.addNode(makeNode({ id: 'n1' }))
      store.selectNode('n1')
      expect(store.selectedPathId).toBeNull()
    })

    it('clearSelection 清除所有选中', () => {
      const store = useCanvasStore()
      store.addNode(makeNode({ id: 'n1' }))
      store.selectNode('n1')
      store.clearSelection()
      expect(store.selectedType).toBeNull()
      expect(store.selectedNodeIds).toEqual([])
      expect(store.selectedPathId).toBeNull()
    })
  })

  describe('getSelectedObject', () => {
    it('无选中返回 null', () => {
      const store = useCanvasStore()
      expect(store.getSelectedObject).toBeNull()
    })

    it('选中节点返回节点信息', () => {
      const store = useCanvasStore()
      store.addNode(makeNode({ id: 'n1', node: 1 }))
      store.addNode(makeNode({ id: 'n2', node: 2 }))
      store.selectNode('n1')
      store.selectNode('n2', true)

      const selected = store.getSelectedObject
      expect(selected?.type).toBe('node')
      if (selected?.type === 'node') {
        expect(selected.nodes).toHaveLength(2)
      }
    })

    it('选中路径返回路径信息', () => {
      const store = useCanvasStore()
      store.addPathLine(makePathLine({ id: 'p1', startNode: 1 }))
      store.selectPath('p1')

      const selected = store.getSelectedObject
      expect(selected?.type).toBe('path')
      if (selected?.type === 'path') {
        expect(selected.path?.id).toBe('p1')
      }
    })
  })

  describe('路径线管理', () => {
    it('addPathLine 添加路径', () => {
      const store = useCanvasStore()
      store.addPathLine(makePathLine({ id: 'p1' }))
      expect(store.pathLines).toHaveLength(1)
    })

    it('addPathFromData 通过节点创建路径', () => {
      const store = useCanvasStore()
      store.addNode(makeNode({ id: 'n1', node: 1, x: 0, y: 0 }))
      store.addNode(makeNode({ id: 'n2', node: 2, x: 3, y: 4 }))

      const path = store.addPathFromData({
        startNode: 1,
        endNode: 2,
        lineType: 0,
        laneDir: 0,
        speed: 100,
        positiveCourse: 0,
        negativeCourse: 180,
        carBodyPositiveCourse: 0,
        carBodyNegativeCourse: 180,
      })

      expect(path.distance).toBe(5) // 3-4-5 三角形
      expect(path.id).toBeDefined()
      expect(store.pathLines).toHaveLength(1)
    })

    it('addPathFromData 节点不存在时抛出错误', () => {
      const store = useCanvasStore()
      expect(() =>
        store.addPathFromData({
          startNode: 999,
          endNode: 888,
          lineType: 0,
          laneDir: 0,
          speed: 100,
          positiveCourse: 0,
          negativeCourse: 0,
          carBodyPositiveCourse: 0,
          carBodyNegativeCourse: 0,
        })
      ).toThrow('起始节点或结束节点不存在')
    })

    it('updatePathLine 更新路径属性', () => {
      const store = useCanvasStore()
      store.addPathLine(makePathLine({ id: 'p1', speed: 100 }))
      store.updatePathLine('p1', { speed: 200 })
      expect(store.pathLines[0].speed).toBe(200)
    })

    it('deletePathLine 删除路径', () => {
      const store = useCanvasStore()
      store.addPathLine(makePathLine({ id: 'p1' }))
      store.addPathLine(makePathLine({ id: 'p2' }))
      store.deletePathLine('p1')
      expect(store.pathLines).toHaveLength(1)
      expect(store.pathLines[0].id).toBe('p2')
    })

    it('deletePathLine 清除选中状态', () => {
      const store = useCanvasStore()
      store.addPathLine(makePathLine({ id: 'p1' }))
      store.selectPath('p1')
      store.deletePathLine('p1')
      expect(store.selectedPathId).toBeNull()
      expect(store.selectedType).toBeNull()
    })

    it('clearAllPathLines 清空所有路径', () => {
      const store = useCanvasStore()
      store.addPathLine(makePathLine({ id: 'p1' }))
      store.addPathLine(makePathLine({ id: 'p2' }))
      store.selectPath('p1')
      store.clearAllPathLines()
      expect(store.pathLines).toHaveLength(0)
      expect(store.selectedPathId).toBeNull()
    })
  })

  describe('节点移动更新路径距离', () => {
    it('移动节点自动更新关联路径距离', () => {
      const store = useCanvasStore()
      store.addNode(makeNode({ id: 'n1', node: 1, x: 0, y: 0 }))
      store.addNode(makeNode({ id: 'n2', node: 2, x: 3, y: 4 }))
      store.addPathLine(makePathLine({ id: 'p1', startNode: 1, endNode: 2, distance: 5 }))

      // 移动 n1 到 (3, 0)，新距离 = sqrt(0 + 16) = 4
      store.updateNode('n1', { x: 3, y: 0 })
      expect(store.pathLines[0].distance).toBe(4)
    })
  })

  describe('视口控制', () => {
    it('setViewport 部分更新', () => {
      const store = useCanvasStore()
      store.setViewport({ x: 100, y: 200 })
      expect(store.viewport).toEqual({ x: 100, y: 200, scale: 1 })
    })

    it('zoomIn 放大', () => {
      const store = useCanvasStore()
      store.zoomIn()
      expect(store.viewport.scale).toBeCloseTo(1.2)
    })

    it('zoomIn 不超过最大值 5', () => {
      const store = useCanvasStore()
      store.viewport.scale = 4.5
      store.zoomIn()
      expect(store.viewport.scale).toBeLessThanOrEqual(5)
    })

    it('zoomOut 缩小', () => {
      const store = useCanvasStore()
      store.zoomOut()
      expect(store.viewport.scale).toBeCloseTo(1 / 1.2)
    })

    it('zoomOut 不低于最小值 0.1', () => {
      const store = useCanvasStore()
      store.viewport.scale = 0.11
      store.zoomOut()
      expect(store.viewport.scale).toBeGreaterThanOrEqual(0.1)
    })

    it('resetViewport 重置', () => {
      const store = useCanvasStore()
      store.setViewport({ x: 500, y: 600, scale: 3 })
      store.resetViewport()
      expect(store.viewport).toEqual({ x: 0, y: 0, scale: 1 })
    })
  })

  describe('gridBaseSize 计算属性', () => {
    it('scale < 0.75 → 40', () => {
      const store = useCanvasStore()
      store.viewport.scale = 0.5
      expect(store.gridBaseSize).toBe(40)
    })

    it('0.75 <= scale < 1.5 → 20', () => {
      const store = useCanvasStore()
      store.viewport.scale = 1
      expect(store.gridBaseSize).toBe(20)
    })

    it('scale >= 1.5 → 10', () => {
      const store = useCanvasStore()
      store.viewport.scale = 2
      expect(store.gridBaseSize).toBe(10)
    })
  })

  describe('工具切换', () => {
    it('setTool 切换工具', () => {
      const store = useCanvasStore()
      store.setTool('path')
      expect(store.currentTool).toBe('path')
    })

    it('切换非 path 工具时取消绘制', () => {
      const store = useCanvasStore()
      store.startPath()
      store.addPathPoint(10, 20)
      expect(store.isDrawingPath).toBe(true)

      store.setTool('select')
      expect(store.isDrawingPath).toBe(false)
      expect(store.currentPathPoints).toEqual([])
    })
  })

  describe('网格吸附', () => {
    it('snapToGrid 关闭时返回原坐标', () => {
      const store = useCanvasStore()
      store.grid.snapToGrid = false
      expect(store.snapToGridPoint(13, 27)).toEqual({ x: 13, y: 27 })
    })

    it('snapToGrid 开启时吸附到网格', () => {
      const store = useCanvasStore()
      store.grid.snapToGrid = true
      store.grid.size = 20
      expect(store.snapToGridPoint(13, 27)).toEqual({ x: 20, y: 20 })
    })

    it('snapToGrid 精确在网格点上', () => {
      const store = useCanvasStore()
      store.grid.snapToGrid = true
      store.grid.size = 20
      expect(store.snapToGridPoint(40, 60)).toEqual({ x: 40, y: 60 })
    })

    it('snapToGrid 中间值四舍五入', () => {
      const store = useCanvasStore()
      store.grid.snapToGrid = true
      store.grid.size = 20
      // Math.round(10/20)*20 = 20, Math.round(30/20)*20 = 40
      expect(store.snapToGridPoint(10, 30)).toEqual({ x: 20, y: 40 })
    })
  })

  describe('路径绘制流程', () => {
    it('startPath → addPathPoint → finishPath', () => {
      const store = useCanvasStore()
      store.startPath()
      expect(store.isDrawingPath).toBe(true)

      store.addPathPoint(0, 0)
      store.addPathPoint(100, 200)
      expect(store.currentPathPoints).toEqual([0, 0, 100, 200])

      store.finishPath()
      expect(store.isDrawingPath).toBe(false)
      expect(store.currentPathPoints).toEqual([])
      expect(store.paths).toHaveLength(1)
      expect(store.paths[0].points).toEqual([0, 0, 100, 200])
    })

    it('finishPath 点数不足不创建路径', () => {
      const store = useCanvasStore()
      store.startPath()
      store.addPathPoint(0, 0) // 只有 2 个数字，不够 4 个
      store.finishPath()
      expect(store.paths).toHaveLength(0)
    })

    it('cancelPath 取消绘制', () => {
      const store = useCanvasStore()
      store.startPath()
      store.addPathPoint(0, 0)
      store.cancelPath()
      expect(store.isDrawingPath).toBe(false)
      expect(store.currentPathPoints).toEqual([])
    })
  })

  describe('导入导出', () => {
    it('loadNodes 加载节点数据', () => {
      const store = useCanvasStore()
      store.loadNodes([
        {
          node: 1,
          type: 1,
          x: 100,
          y: 200,
          leftStation: 0,
          rightStation: '',
          nodeAttr: 'COMMON',
          nodeType: 'LOAD',
          navigationMode: 0,
          avoidable: 1,
          enable: false,
          speed: 1000,
          dir: 0,
          floor: 1,
          regionName: '',
          stationName: '',
        },
      ])
      expect(store.nodes).toHaveLength(1)
      expect(store.nodes[0].id).toBeDefined()
      expect(store.nodes[0].label).toBe('工位')
    })

    it('loadNodes 清除选中状态', () => {
      const store = useCanvasStore()
      store.addNode(makeNode({ id: 'n1' }))
      store.selectNode('n1')
      store.loadNodes([])
      expect(store.selectedNodeIds).toEqual([])
    })

    it('getExportData 导出节点数据', () => {
      const store = useCanvasStore()
      store.addNode(makeNode({ id: 'n1', node: 1, x: 100, y: 200 }))
      const exported = store.getExportData()
      expect(exported).toHaveLength(1)
      expect((exported[0] as any).id).toBeUndefined()
      expect((exported[0] as any).width).toBeUndefined()
      expect(exported[0].node).toBe(1)
      expect(exported[0].x).toBe(100)
    })
  })
})
