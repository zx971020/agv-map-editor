import { DEFAULT_PATH_GRAPHIC, getPathGraphicDefaults } from '@/config/pathGraphics'

describe('DEFAULT_PATH_GRAPHIC', () => {
  it('有合理的默认值', () => {
    expect(DEFAULT_PATH_GRAPHIC.strokeColor).toBe('#3b82f6')
    expect(DEFAULT_PATH_GRAPHIC.strokeWidth).toBe(2)
    expect(DEFAULT_PATH_GRAPHIC.showArrow).toBe(false)
  })
})

describe('getPathGraphicDefaults', () => {
  describe('直线 + 单向 (lineType=0, laneDir=0)', () => {
    it('返回绿色、有箭头、无虚线', () => {
      const result = getPathGraphicDefaults(0, 0)
      expect(result.strokeColor).toBe('#10b981')
      expect(result.showArrow).toBe(true)
      expect(result.strokeWidth).toBe(2)
      expect(result.dash).toBeUndefined()
    })
  })

  describe('直线 + 双向 (lineType=0, laneDir=1)', () => {
    it('返回蓝色、无箭头、无虚线', () => {
      const result = getPathGraphicDefaults(0, 1)
      expect(result.strokeColor).toBe('#3b82f6')
      expect(result.showArrow).toBe(false)
      expect(result.dash).toBeUndefined()
    })
  })

  describe('弧线 + 单向 (lineType=1, laneDir=0)', () => {
    it('返回绿色、有箭头、有虚线', () => {
      const result = getPathGraphicDefaults(1, 0)
      expect(result.strokeColor).toBe('#10b981')
      expect(result.showArrow).toBe(true)
      expect(result.dash).toEqual([5, 5])
    })
  })

  describe('弧线 + 双向 (lineType=1, laneDir=1)', () => {
    it('返回蓝色、无箭头、有虚线', () => {
      const result = getPathGraphicDefaults(1, 1)
      expect(result.strokeColor).toBe('#3b82f6')
      expect(result.showArrow).toBe(false)
      expect(result.dash).toEqual([5, 5])
    })
  })

  describe('未知组合', () => {
    it('未知 lineType 使用默认 strokeWidth', () => {
      const result = getPathGraphicDefaults(99, 0)
      expect(result.strokeWidth).toBe(2)
      expect(result.strokeColor).toBe('#10b981') // laneDir=0 仍生效
    })

    it('未知 laneDir 使用默认 strokeColor', () => {
      const result = getPathGraphicDefaults(0, 99)
      expect(result.strokeColor).toBe('#3b82f6') // 默认蓝色
    })
  })
})
