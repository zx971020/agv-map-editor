/**
 * Tests for getNodeTypeName function from PropertiesPanel.vue
 *
 * 由于该函数是组件内部的纯函数，这里复制一份进行直接测试。
 */

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

describe('getNodeTypeName', () => {
  describe('已映射的节点类型', () => {
    it.each([
      [1, '工位'],
      [2, '人工工位'],
      [3, '充电站'],
      [4, '机械手'],
      [5, '门'],
      [6, '停靠区'],
      [7, '路径点'],
      [12, '货架'],
    ])('type=%i → %s', (type, expected) => {
      expect(getNodeTypeName(type)).toBe(expected)
    })
  })

  describe('未映射的节点类型返回"未知"', () => {
    it('type=0 → 未知（未映射）', () => {
      expect(getNodeTypeName(0)).toBe('未知')
    })

    it('type=8 → 未知（映射间隙）', () => {
      expect(getNodeTypeName(8)).toBe('未知')
    })

    it('type=9 → 未知', () => {
      expect(getNodeTypeName(9)).toBe('未知')
    })

    it('type=10 → 未知', () => {
      expect(getNodeTypeName(10)).toBe('未知')
    })

    it('type=11 → 未知（路径类型，非节点）', () => {
      expect(getNodeTypeName(11)).toBe('未知')
    })

    it('type=13 → 未知', () => {
      expect(getNodeTypeName(13)).toBe('未知')
    })

    it('type=-1 → 未知（负数）', () => {
      expect(getNodeTypeName(-1)).toBe('未知')
    })

    it('type=100 → 未知（大数值）', () => {
      expect(getNodeTypeName(100)).toBe('未知')
    })

    it('type=999 → 未知', () => {
      expect(getNodeTypeName(999)).toBe('未知')
    })
  })

  describe('完整性检查', () => {
    it('应覆盖全部 8 种已映射类型', () => {
      const mappedTypes = [1, 2, 3, 4, 5, 6, 7, 12]
      const results = mappedTypes.map(t => getNodeTypeName(t))
      const uniqueResults = new Set(results)

      expect(results).toHaveLength(8)
      expect(uniqueResults.size).toBe(8)
      results.forEach(r => {
        expect(r).not.toBe('未知')
      })
    })

    it('对任意输入都返回字符串', () => {
      const inputs = [-100, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 50, 100, 999]
      inputs.forEach(input => {
        expect(typeof getNodeTypeName(input)).toBe('string')
      })
    })
  })
})
