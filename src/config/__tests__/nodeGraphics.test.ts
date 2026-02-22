import {
  NODE_GRAPHIC_DEFAULTS,
  DEFAULT_GRAPHIC_PROPS,
  getNodeGraphicDefaults,
  getNodeLabel,
} from '@/config/nodeGraphics'

const KNOWN_TYPES = [1, 2, 3, 4, 5, 6, 7, 12]

describe('NODE_GRAPHIC_DEFAULTS', () => {
  it('包含所有已知类型', () => {
    KNOWN_TYPES.forEach(type => {
      expect(NODE_GRAPHIC_DEFAULTS[type]).toBeDefined()
    })
  })

  it('每个类型都有 width, height, rotation, label', () => {
    KNOWN_TYPES.forEach(type => {
      const defaults = NODE_GRAPHIC_DEFAULTS[type]
      expect(typeof defaults.width).toBe('number')
      expect(typeof defaults.height).toBe('number')
      expect(typeof defaults.rotation).toBe('number')
      expect(typeof defaults.label).toBe('string')
      expect(defaults.width).toBeGreaterThan(0)
      expect(defaults.height).toBeGreaterThan(0)
    })
  })
})

describe('DEFAULT_GRAPHIC_PROPS', () => {
  it('有合理的默认值', () => {
    expect(DEFAULT_GRAPHIC_PROPS.width).toBe(50)
    expect(DEFAULT_GRAPHIC_PROPS.height).toBe(50)
    expect(DEFAULT_GRAPHIC_PROPS.rotation).toBe(0)
    expect(DEFAULT_GRAPHIC_PROPS.label).toBe('未知节点')
  })
})

describe('getNodeGraphicDefaults', () => {
  it('已知类型返回对应配置', () => {
    const result = getNodeGraphicDefaults(1)
    expect(result).toEqual(NODE_GRAPHIC_DEFAULTS[1])
  })

  it('返回的是副本，不是引用', () => {
    const a = getNodeGraphicDefaults(1)
    const b = getNodeGraphicDefaults(1)
    expect(a).toEqual(b)
    expect(a).not.toBe(b)
  })

  it('未知类型返回默认值', () => {
    const result = getNodeGraphicDefaults(999)
    expect(result.width).toBe(DEFAULT_GRAPHIC_PROPS.width)
    expect(result.height).toBe(DEFAULT_GRAPHIC_PROPS.height)
    expect(result.rotation).toBe(DEFAULT_GRAPHIC_PROPS.rotation)
  })

  it.each(KNOWN_TYPES)('type=%i 返回正确的 label', type => {
    const result = getNodeGraphicDefaults(type)
    expect(result.label).toBe(NODE_GRAPHIC_DEFAULTS[type].label)
  })
})

describe('getNodeLabel', () => {
  it.each([
    [1, '工位'],
    [2, '人工工位'],
    [3, '充电站'],
    [4, '机械手'],
    [5, '门'],
    [6, '停靠区'],
    [7, '普通路径点'],
    [12, '货架'],
  ])('type=%i → %s', (type, expected) => {
    expect(getNodeLabel(type)).toBe(expected)
  })

  it('未知类型返回"未知节点"', () => {
    expect(getNodeLabel(999)).toBe('未知节点')
  })
})
