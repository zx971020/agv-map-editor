import type { NodeData, CanvasNode } from '@/types'
import {
  generateNodeId,
  importNodes,
  importNode,
  exportNodes,
  exportNode,
  generateUniqueNodeNumber,
  createNode,
} from '@/utils/nodeTransform'

// 工厂函数：创建测试用 NodeData
function makeNodeData(overrides: Partial<NodeData> = {}): NodeData {
  return {
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
    ...overrides,
  }
}

// 工厂函数：创建测试用 CanvasNode
function makeCanvasNode(overrides: Partial<CanvasNode> = {}): CanvasNode {
  return {
    id: 'test-id-1',
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

describe('generateNodeId', () => {
  it('返回非空字符串', () => {
    const id = generateNodeId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('每次调用返回不同的 ID', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateNodeId()))
    expect(ids.size).toBe(100)
  })
})

describe('importNode', () => {
  it('添加 id 和图形属性', () => {
    const data = makeNodeData({ type: 1 })
    const result = importNode(data)

    expect(result.id).toBeDefined()
    expect(typeof result.id).toBe('string')
    expect(result.width).toBe(50)
    expect(result.height).toBe(50)
    expect(result.rotation).toBe(0)
    expect(result.label).toBe('工位')
  })

  it('保留原始业务数据', () => {
    const data = makeNodeData({ node: 42, x: 300, y: 400 })
    const result = importNode(data)

    expect(result.node).toBe(42)
    expect(result.x).toBe(300)
    expect(result.y).toBe(400)
    expect(result.nodeAttr).toBe('COMMON')
  })

  it('不同类型获取不同图形属性', () => {
    const workstation = importNode(makeNodeData({ type: 1 }))
    const charging = importNode(makeNodeData({ type: 3 }))
    const pathPoint = importNode(makeNodeData({ type: 7 }))

    expect(workstation.label).toBe('工位')
    expect(charging.label).toBe('充电站')
    expect(pathPoint.label).toBe('普通路径点')

    expect(charging.width).toBe(60)
    expect(pathPoint.width).toBe(30)
  })
})

describe('importNodes', () => {
  it('空数组返回空数组', () => {
    expect(importNodes([])).toEqual([])
  })

  it('批量转换多个节点', () => {
    const data = [
      makeNodeData({ node: 1, type: 1 }),
      makeNodeData({ node: 2, type: 3 }),
      makeNodeData({ node: 3, type: 7 }),
    ]
    const result = importNodes(data)

    expect(result).toHaveLength(3)
    result.forEach(node => {
      expect(node.id).toBeDefined()
      expect(node.width).toBeGreaterThan(0)
    })
  })

  it('每个节点有唯一 ID', () => {
    const data = [makeNodeData({ node: 1 }), makeNodeData({ node: 2 })]
    const result = importNodes(data)
    expect(result[0].id).not.toBe(result[1].id)
  })
})

describe('exportNode', () => {
  it('移除 id 和图形属性', () => {
    const node = makeCanvasNode()
    const result = exportNode(node)

    expect((result as any).id).toBeUndefined()
    expect((result as any).width).toBeUndefined()
    expect((result as any).height).toBeUndefined()
    expect((result as any).rotation).toBeUndefined()
    expect((result as any).label).toBeUndefined()
  })

  it('保留业务数据', () => {
    const node = makeCanvasNode({ node: 99, x: 500, y: 600, speed: 2000 })
    const result = exportNode(node)

    expect(result.node).toBe(99)
    expect(result.x).toBe(500)
    expect(result.y).toBe(600)
    expect(result.speed).toBe(2000)
  })
})

describe('exportNodes', () => {
  it('空数组返回空数组', () => {
    expect(exportNodes([])).toEqual([])
  })

  it('批量导出', () => {
    const nodes = [makeCanvasNode({ id: 'a', node: 1 }), makeCanvasNode({ id: 'b', node: 2 })]
    const result = exportNodes(nodes)

    expect(result).toHaveLength(2)
    result.forEach(data => {
      expect((data as any).id).toBeUndefined()
      expect((data as any).width).toBeUndefined()
    })
  })
})

describe('importNode → exportNode 往返转换', () => {
  it('导入再导出后业务数据一致', () => {
    const original = makeNodeData({ node: 10, type: 3, x: 123, y: 456 })
    const imported = importNode(original)
    const exported = exportNode(imported)

    expect(exported.node).toBe(original.node)
    expect(exported.type).toBe(original.type)
    expect(exported.x).toBe(original.x)
    expect(exported.y).toBe(original.y)
    expect(exported.nodeAttr).toBe(original.nodeAttr)
    expect(exported.speed).toBe(original.speed)
  })
})

describe('generateUniqueNodeNumber', () => {
  it('空列表返回 1', () => {
    expect(generateUniqueNodeNumber([])).toBe(1)
  })

  it('返回最大编号 + 1', () => {
    const nodes = [
      makeCanvasNode({ node: 5 }),
      makeCanvasNode({ node: 10 }),
      makeCanvasNode({ node: 3 }),
    ]
    expect(generateUniqueNodeNumber(nodes)).toBe(11)
  })

  it('处理字符串编号', () => {
    const nodes = [makeCanvasNode({ node: '5' as any }), makeCanvasNode({ node: '20' as any })]
    expect(generateUniqueNodeNumber(nodes)).toBe(21)
  })

  it('处理非数字编号（忽略）', () => {
    const nodes = [makeCanvasNode({ node: 'abc' as any }), makeCanvasNode({ node: 5 })]
    expect(generateUniqueNodeNumber(nodes)).toBe(6)
  })

  it('所有编号都无效时返回 1', () => {
    const nodes = [makeCanvasNode({ node: 'abc' as any }), makeCanvasNode({ node: 'xyz' as any })]
    expect(generateUniqueNodeNumber(nodes)).toBe(1)
  })
})

describe('createNode', () => {
  it('创建完整的运行时节点', () => {
    const node = createNode({ type: 1, x: 100, y: 200 })

    expect(node.id).toBeDefined()
    expect(node.type).toBe(1)
    expect(node.x).toBe(100)
    expect(node.y).toBe(200)
    expect(node.width).toBe(50)
    expect(node.label).toBe('工位')
    expect(node.node).toBe(1) // 空列表，从 1 开始
  })

  it('自动生成唯一编号', () => {
    const existing = [makeCanvasNode({ node: 5 }), makeCanvasNode({ node: 10 })]
    const node = createNode({ type: 1, x: 0, y: 0 }, existing)

    expect(node.node).toBe(11)
  })

  it('使用默认业务数据', () => {
    const node = createNode({ type: 7, x: 0, y: 0 })

    expect(node.leftStation).toBe(0)
    expect(node.rightStation).toBe('')
    expect(node.nodeAttr).toBe('COMMON')
    expect(node.nodeType).toBe('PATH')
    expect(node.avoidable).toBe(1)
    expect(node.speed).toBe(1000)
    expect(node.floor).toBe(1)
  })

  it('部分数据可覆盖默认值', () => {
    const node = createNode({
      type: 3,
      x: 50,
      y: 60,
      speed: 500,
      regionName: '区域A',
    })

    expect(node.speed).toBe(500)
    expect(node.regionName).toBe('区域A')
    expect(node.type).toBe(3)
  })

  it('图形属性根据 type 设置', () => {
    const charging = createNode({ type: 3, x: 0, y: 0 })
    expect(charging.width).toBe(60)
    expect(charging.height).toBe(60)
    expect(charging.label).toBe('充电站')

    const gate = createNode({ type: 5, x: 0, y: 0 })
    expect(gate.width).toBe(40)
    expect(gate.height).toBe(40)
    expect(gate.label).toBe('门')
  })
})
