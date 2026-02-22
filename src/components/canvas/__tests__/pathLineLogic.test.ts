/**
 * PathLineElement 路径计算逻辑单元测试
 *
 * 测试从 PathLineElement.vue 提取的纯函数：
 * - calcMidPoint: 计算路径中点（直线 / 贝塞尔曲线）
 * - calcArrowAngle: 计算箭头角度（直线 / 贝塞尔曲线切线）
 */

interface Point {
  x: number
  y: number
}

function calcMidPoint(start: Point, end: Point, lineType: number, cpx = 0, cpy = 0): Point {
  if (lineType === 0) {
    return { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }
  } else {
    const t = 0.5
    return {
      x: Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * cpx + Math.pow(t, 2) * end.x,
      y: Math.pow(1 - t, 2) * start.y + 2 * (1 - t) * t * cpy + Math.pow(t, 2) * end.y,
    }
  }
}

function calcArrowAngle(start: Point, end: Point, lineType: number, cpx = 0, cpy = 0): number {
  if (lineType === 0) {
    return Math.atan2(end.y - start.y, end.x - start.x)
  } else {
    const t = 0.5
    const dx = 2 * (1 - t) * (cpx - start.x) + 2 * t * (end.x - cpx)
    const dy = 2 * (1 - t) * (cpy - start.y) + 2 * t * (end.y - cpy)
    return Math.atan2(dy, dx)
  }
}

// ---------------------------------------------------------------------------
// calcMidPoint 测试
// ---------------------------------------------------------------------------

describe('calcMidPoint', () => {
  describe('直线 (lineType=0)', () => {
    it('水平线：(0,0)→(100,0) → 中点 (50,0)', () => {
      const result = calcMidPoint({ x: 0, y: 0 }, { x: 100, y: 0 }, 0)
      expect(result.x).toBeCloseTo(50)
      expect(result.y).toBeCloseTo(0)
    })

    it('垂直线：(0,0)→(0,100) → 中点 (0,50)', () => {
      const result = calcMidPoint({ x: 0, y: 0 }, { x: 0, y: 100 }, 0)
      expect(result.x).toBeCloseTo(0)
      expect(result.y).toBeCloseTo(50)
    })

    it('对角线：(0,0)→(100,100) → 中点 (50,50)', () => {
      const result = calcMidPoint({ x: 0, y: 0 }, { x: 100, y: 100 }, 0)
      expect(result.x).toBeCloseTo(50)
      expect(result.y).toBeCloseTo(50)
    })

    it('负坐标：(-100,-100)→(100,100) → 中点 (0,0)', () => {
      const result = calcMidPoint({ x: -100, y: -100 }, { x: 100, y: 100 }, 0)
      expect(result.x).toBeCloseTo(0)
      expect(result.y).toBeCloseTo(0)
    })

    it('同一点：(50,50)→(50,50) → 中点 (50,50)', () => {
      const result = calcMidPoint({ x: 50, y: 50 }, { x: 50, y: 50 }, 0)
      expect(result.x).toBeCloseTo(50)
      expect(result.y).toBeCloseTo(50)
    })

    it('大坐标：(10000,20000)→(30000,40000) → 中点 (20000,30000)', () => {
      const result = calcMidPoint({ x: 10000, y: 20000 }, { x: 30000, y: 40000 }, 0)
      expect(result.x).toBeCloseTo(20000)
      expect(result.y).toBeCloseTo(30000)
    })

    it('小数坐标：(1.5,2.5)→(3.5,4.5) → 中点 (2.5,3.5)', () => {
      const result = calcMidPoint({ x: 1.5, y: 2.5 }, { x: 3.5, y: 4.5 }, 0)
      expect(result.x).toBeCloseTo(2.5)
      expect(result.y).toBeCloseTo(3.5)
    })
  })

  describe('弧线 (lineType=1)', () => {
    it('控制点在直线中点 → 结果与直线中点相同', () => {
      const start = { x: 0, y: 0 }
      const end = { x: 100, y: 0 }
      const cpx = 50
      const cpy = 0

      const arcMid = calcMidPoint(start, end, 1, cpx, cpy)
      const straightMid = calcMidPoint(start, end, 0)

      expect(arcMid.x).toBeCloseTo(straightMid.x)
      expect(arcMid.y).toBeCloseTo(straightMid.y)
    })

    it('控制点在线段上方：y 分量应 > 0', () => {
      const result = calcMidPoint({ x: 0, y: 0 }, { x: 100, y: 0 }, 1, 50, 100)
      expect(result.x).toBeCloseTo(50)
      expect(result.y).toBeGreaterThan(0)
    })

    it('控制点在线段下方：y 分量应 < 0', () => {
      const result = calcMidPoint({ x: 0, y: 0 }, { x: 100, y: 0 }, 1, 50, -100)
      expect(result.x).toBeCloseTo(50)
      expect(result.y).toBeLessThan(0)
    })

    it('控制点在起点：中点偏向起点', () => {
      const start = { x: 0, y: 0 }
      const end = { x: 100, y: 0 }
      const straightMid = calcMidPoint(start, end, 0)

      // cp = start → 曲线被拉向起点
      const result = calcMidPoint(start, end, 1, start.x, start.y)
      expect(result.x).toBeLessThan(straightMid.x)
    })

    it('控制点在终点：中点偏向终点', () => {
      const start = { x: 0, y: 0 }
      const end = { x: 100, y: 0 }
      const straightMid = calcMidPoint(start, end, 0)

      // cp = end → 曲线被拉向终点
      const result = calcMidPoint(start, end, 1, end.x, end.y)
      expect(result.x).toBeGreaterThan(straightMid.x)
    })

    it('对称弧线：cp.x 在中点时 x 分量等于中点', () => {
      const start = { x: 0, y: 0 }
      const end = { x: 200, y: 0 }
      // cp.x = 100（中点），cp.y 任意偏移
      const result = calcMidPoint(start, end, 1, 100, 80)
      expect(result.x).toBeCloseTo(100)
    })

    it('默认控制点 cpx=0, cpy=0', () => {
      const start = { x: 0, y: 0 }
      const end = { x: 100, y: 100 }
      const result = calcMidPoint(start, end, 1, 0, 0)

      // B(0.5) = 0.25*start + 0.5*cp + 0.25*end
      // x = 0.25*0 + 0.5*0 + 0.25*100 = 25
      // y = 0.25*0 + 0.5*0 + 0.25*100 = 25
      expect(result.x).toBeCloseTo(25)
      expect(result.y).toBeCloseTo(25)
    })

    it('验证贝塞尔公式精确值', () => {
      const start = { x: 10, y: 20 }
      const end = { x: 90, y: 80 }
      const cpx = 60
      const cpy = 10

      // B(0.5) = 0.25 * start + 0.5 * cp + 0.25 * end
      const expectedX = 0.25 * 10 + 0.5 * 60 + 0.25 * 90 // 2.5 + 30 + 22.5 = 55
      const expectedY = 0.25 * 20 + 0.5 * 10 + 0.25 * 80 // 5 + 5 + 20 = 30

      const result = calcMidPoint(start, end, 1, cpx, cpy)
      expect(result.x).toBeCloseTo(expectedX)
      expect(result.y).toBeCloseTo(expectedY)
    })
  })
})

// ---------------------------------------------------------------------------
// calcArrowAngle 测试
// ---------------------------------------------------------------------------

describe('calcArrowAngle', () => {
  describe('直线 (lineType=0)', () => {
    it('水平向右：(0,0)→(100,0) → 角度 = 0', () => {
      const angle = calcArrowAngle({ x: 0, y: 0 }, { x: 100, y: 0 }, 0)
      expect(angle).toBeCloseTo(0)
    })

    it('水平向左：(100,0)→(0,0) → 角度 = PI 或 -PI', () => {
      const angle = calcArrowAngle({ x: 100, y: 0 }, { x: 0, y: 0 }, 0)
      // Math.atan2(0, -100) = PI
      expect(Math.abs(angle)).toBeCloseTo(Math.PI)
    })

    it('垂直向上（y 增大）：(0,0)→(0,100) → 角度 = PI/2', () => {
      const angle = calcArrowAngle({ x: 0, y: 0 }, { x: 0, y: 100 }, 0)
      expect(angle).toBeCloseTo(Math.PI / 2)
    })

    it('垂直向下（y 减小）：(0,100)→(0,0) → 角度 = -PI/2', () => {
      const angle = calcArrowAngle({ x: 0, y: 100 }, { x: 0, y: 0 }, 0)
      expect(angle).toBeCloseTo(-Math.PI / 2)
    })

    it('对角线 45°：(0,0)→(100,100) → 角度 = PI/4', () => {
      const angle = calcArrowAngle({ x: 0, y: 0 }, { x: 100, y: 100 }, 0)
      expect(angle).toBeCloseTo(Math.PI / 4)
    })

    it('对角线 135°：(0,0)→(-100,100) → 角度 = 3*PI/4', () => {
      const angle = calcArrowAngle({ x: 0, y: 0 }, { x: -100, y: 100 }, 0)
      expect(angle).toBeCloseTo((3 * Math.PI) / 4)
    })

    it('同一点：(0,0)→(0,0) → 角度 = 0（atan2(0,0)）', () => {
      const angle = calcArrowAngle({ x: 0, y: 0 }, { x: 0, y: 0 }, 0)
      expect(angle).toBeCloseTo(0)
    })
  })

  describe('弧线 (lineType=1)', () => {
    it('对称弧线：切线方向应指向终点方向', () => {
      // 水平线 + 控制点在正上方 → t=0.5 处切线应水平
      const start = { x: 0, y: 0 }
      const end = { x: 100, y: 0 }
      const cpx = 50
      const cpy = 50

      const angle = calcArrowAngle(start, end, 1, cpx, cpy)
      // 切线 dx = 2*0.5*(50-0) + 2*0.5*(100-50) = 50 + 50 = 100
      // 切线 dy = 2*0.5*(50-0) + 2*0.5*(0-50) = 50 - 50 = 0
      // atan2(0, 100) = 0
      expect(angle).toBeCloseTo(0)
    })

    it('控制点在水平线正上方中点 → 切线应水平（角度 ≈ 0）', () => {
      const start = { x: 0, y: 0 }
      const end = { x: 200, y: 0 }
      const cpx = 100 // 中点
      const cpy = 500 // 远在上方

      const angle = calcArrowAngle(start, end, 1, cpx, cpy)
      // dx = 2*0.5*(100-0) + 2*0.5*(200-100) = 100 + 100 = 200
      // dy = 2*0.5*(500-0) + 2*0.5*(0-500) = 500 - 500 = 0
      expect(angle).toBeCloseTo(0)
    })

    it('t=0.5 处弧线切线方向恒等于直线方向（二次贝塞尔数学性质）', () => {
      // 二次贝塞尔 B'(t) = 2(1-t)(cp-start) + 2t(end-cp)
      // 当 t=0.5 时：B'(0.5) = (cp-start) + (end-cp) = end - start
      // 所以 t=0.5 处切线方向总等于 end-start，与控制点无关
      const start = { x: 0, y: 0 }
      const end = { x: 100, y: 50 }

      const straightAngle = calcArrowAngle(start, end, 0)

      // 无论控制点在哪，弧线在 t=0.5 处的切线角度都等于直线角度
      const arcAngle1 = calcArrowAngle(start, end, 1, 30, 200)
      const arcAngle2 = calcArrowAngle(start, end, 1, -500, -300)
      const arcAngle3 = calcArrowAngle(start, end, 1, 80, 100)

      expect(arcAngle1).toBeCloseTo(straightAngle)
      expect(arcAngle2).toBeCloseTo(straightAngle)
      expect(arcAngle3).toBeCloseTo(straightAngle)
    })

    it('验证弧线切线公式精确值', () => {
      const start = { x: 10, y: 20 }
      const end = { x: 90, y: 80 }
      const cpx = 60
      const cpy = 10

      // t=0.5 处切线：
      // dx = 2*(1-0.5)*(60-10) + 2*0.5*(90-60) = 50 + 30 = 80
      // dy = 2*(1-0.5)*(10-20) + 2*0.5*(80-10) = -10 + 70 = 60
      const expectedAngle = Math.atan2(60, 80)

      const angle = calcArrowAngle(start, end, 1, cpx, cpy)
      expect(angle).toBeCloseTo(expectedAngle)
    })

    it('控制点与起点重合时的切线', () => {
      const start = { x: 0, y: 0 }
      const end = { x: 100, y: 100 }

      // cp = start → dx = 2*0.5*(0-0) + 2*0.5*(100-0) = 100
      //              dy = 2*0.5*(0-0) + 2*0.5*(100-0) = 100
      const angle = calcArrowAngle(start, end, 1, start.x, start.y)
      expect(angle).toBeCloseTo(Math.atan2(100, 100)) // PI/4
    })

    it('控制点与终点重合时的切线', () => {
      const start = { x: 0, y: 0 }
      const end = { x: 100, y: 100 }

      // cp = end → dx = 2*0.5*(100-0) + 2*0.5*(100-100) = 100
      //            dy = 2*0.5*(100-0) + 2*0.5*(100-100) = 100
      const angle = calcArrowAngle(start, end, 1, end.x, end.y)
      expect(angle).toBeCloseTo(Math.atan2(100, 100)) // PI/4
    })
  })
})
