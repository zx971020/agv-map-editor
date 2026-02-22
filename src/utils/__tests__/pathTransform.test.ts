import type { PathData, CanvasPathLine } from '@/types'
import {
  generatePathId,
  calculateDistance,
  importPaths,
  importPath,
  exportPaths,
  exportPath,
  createPath,
} from '@/utils/pathTransform'

// 工厂函数：创建测试用 PathData
function makePathData(overrides: Partial<PathData> = {}): PathData {
  return {
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
    ...overrides,
  }
}

// 工厂函数：创建测试用 CanvasPathLine
function makeCanvasPathLine(overrides: Partial<CanvasPathLine> = {}): CanvasPathLine {
  return {
    id: 'test-path-1',
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

describe('generatePathId', () => {
  it('返回非空字符串', () => {
    const id = generatePathId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('每次调用返回不同的 ID', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generatePathId()))
    expect(ids.size).toBe(100)
  })
})

describe('calculateDistance', () => {
  it('同一点距离为 0', () => {
    expect(calculateDistance(0, 0, 0, 0)).toBe(0)
    expect(calculateDistance(100, 200, 100, 200)).toBe(0)
  })

  it('水平距离', () => {
    expect(calculateDistance(0, 0, 3, 0)).toBe(3)
    expect(calculateDistance(0, 0, -4, 0)).toBe(4)
  })

  it('垂直距离', () => {
    expect(calculateDistance(0, 0, 0, 5)).toBe(5)
  })

  it('勾股定理 3-4-5', () => {
    expect(calculateDistance(0, 0, 3, 4)).toBe(5)
  })

  it('勾股定理 5-12-13', () => {
    expect(calculateDistance(0, 0, 5, 12)).toBe(13)
  })

  it('对称性：交换起终点结果相同', () => {
    const d1 = calculateDistance(10, 20, 30, 40)
    const d2 = calculateDistance(30, 40, 10, 20)
    expect(d1).toBeCloseTo(d2)
  })

  it('负坐标', () => {
    expect(calculateDistance(-3, 0, 0, 4)).toBe(5)
  })

  it('大坐标值', () => {
    const d = calculateDistance(0, 0, 30000, 40000)
    expect(d).toBe(50000)
  })
})

describe('importPath', () => {
  it('添加 id 和图形属性', () => {
    const data = makePathData({ lineType: 0, laneDir: 0 })
    const result = importPath(data)

    expect(result.id).toBeDefined()
    expect(typeof result.id).toBe('string')
    expect(result.strokeColor).toBe('#10b981') // 单向绿色
    expect(result.showArrow).toBe(true)
    expect(result.strokeWidth).toBe(2)
  })

  it('保留原始业务数据', () => {
    const data = makePathData({ startNode: 10, endNode: 20, speed: 200 })
    const result = importPath(data)

    expect(result.startNode).toBe(10)
    expect(result.endNode).toBe(20)
    expect(result.speed).toBe(200)
    expect(result.type).toBe(11)
  })

  it('弧线 + 双向的图形属性', () => {
    const data = makePathData({ lineType: 1, laneDir: 1 })
    const result = importPath(data)

    expect(result.strokeColor).toBe('#3b82f6') // 双向蓝色
    expect(result.showArrow).toBe(false)
    expect(result.dash).toEqual([5, 5]) // 弧线虚线
  })

  it('保留弧线控制点', () => {
    const data = makePathData({ lineType: 1, cpx: 150, cpy: 250 })
    const result = importPath(data)

    expect(result.cpx).toBe(150)
    expect(result.cpy).toBe(250)
  })
})

describe('importPaths', () => {
  it('空数组返回空数组', () => {
    expect(importPaths([])).toEqual([])
  })

  it('批量转换', () => {
    const data = [
      makePathData({ startNode: 1, endNode: 2 }),
      makePathData({ startNode: 3, endNode: 4 }),
    ]
    const result = importPaths(data)

    expect(result).toHaveLength(2)
    expect(result[0].id).not.toBe(result[1].id)
  })
})

describe('exportPath', () => {
  it('移除 id 和图形属性', () => {
    const path = makeCanvasPathLine()
    const result = exportPath(path)

    expect((result as any).id).toBeUndefined()
    expect((result as any).strokeColor).toBeUndefined()
    expect((result as any).strokeWidth).toBeUndefined()
    expect((result as any).showArrow).toBeUndefined()
    expect((result as any).dash).toBeUndefined()
  })

  it('保留业务数据', () => {
    const path = makeCanvasPathLine({ startNode: 10, endNode: 20, speed: 300 })
    const result = exportPath(path)

    expect(result.startNode).toBe(10)
    expect(result.endNode).toBe(20)
    expect(result.speed).toBe(300)
    expect(result.type).toBe(11)
  })

  it('保留弧线控制点', () => {
    const path = makeCanvasPathLine({ lineType: 1, cpx: 100, cpy: 200 })
    const result = exportPath(path)

    expect(result.cpx).toBe(100)
    expect(result.cpy).toBe(200)
  })
})

describe('exportPaths', () => {
  it('空数组返回空数组', () => {
    expect(exportPaths([])).toEqual([])
  })

  it('批量导出', () => {
    const paths = [makeCanvasPathLine({ id: 'a' }), makeCanvasPathLine({ id: 'b' })]
    const result = exportPaths(paths)

    expect(result).toHaveLength(2)
    result.forEach(data => {
      expect((data as any).id).toBeUndefined()
      expect((data as any).strokeColor).toBeUndefined()
    })
  })
})

describe('importPath → exportPath 往返转换', () => {
  it('导入再导出后业务数据一致', () => {
    const original = makePathData({
      startNode: 5,
      endNode: 10,
      lineType: 1,
      laneDir: 1,
      speed: 150,
      cpx: 300,
      cpy: 400,
    })
    const imported = importPath(original)
    const exported = exportPath(imported)

    expect(exported.startNode).toBe(original.startNode)
    expect(exported.endNode).toBe(original.endNode)
    expect(exported.lineType).toBe(original.lineType)
    expect(exported.laneDir).toBe(original.laneDir)
    expect(exported.speed).toBe(original.speed)
    expect(exported.cpx).toBe(original.cpx)
    expect(exported.cpy).toBe(original.cpy)
    expect(exported.type).toBe(11)
  })
})

describe('createPath', () => {
  it('自动计算距离', () => {
    const path = createPath(
      {
        startNode: 1,
        endNode: 2,
        lineType: 0,
        laneDir: 0,
        speed: 100,
        positiveCourse: 0,
        negativeCourse: 180,
        carBodyPositiveCourse: 0,
        carBodyNegativeCourse: 180,
      },
      0,
      0,
      3,
      4 // 3-4-5 三角形
    )

    expect(path.distance).toBe(5)
  })

  it('设置 type 为 11', () => {
    const path = createPath(
      {
        startNode: 1,
        endNode: 2,
        lineType: 0,
        laneDir: 0,
        speed: 100,
        positiveCourse: 0,
        negativeCourse: 0,
        carBodyPositiveCourse: 0,
        carBodyNegativeCourse: 0,
      },
      0,
      0,
      100,
      0
    )

    expect(path.type).toBe(11)
  })

  it('添加图形属性', () => {
    const path = createPath(
      {
        startNode: 1,
        endNode: 2,
        lineType: 0,
        laneDir: 0,
        speed: 100,
        positiveCourse: 0,
        negativeCourse: 0,
        carBodyPositiveCourse: 0,
        carBodyNegativeCourse: 0,
      },
      0,
      0,
      100,
      0
    )

    expect(path.id).toBeDefined()
    expect(path.strokeColor).toBe('#10b981')
    expect(path.showArrow).toBe(true)
  })

  it('弧线路径有正确的图形属性', () => {
    const path = createPath(
      {
        startNode: 1,
        endNode: 2,
        lineType: 1,
        laneDir: 1,
        speed: 100,
        positiveCourse: 0,
        negativeCourse: 0,
        carBodyPositiveCourse: 0,
        carBodyNegativeCourse: 0,
        cpx: 50,
        cpy: 50,
      },
      0,
      0,
      100,
      0
    )

    expect(path.dash).toEqual([5, 5])
    expect(path.strokeColor).toBe('#3b82f6')
    expect(path.showArrow).toBe(false)
    expect(path.cpx).toBe(50)
    expect(path.cpy).toBe(50)
  })
})
