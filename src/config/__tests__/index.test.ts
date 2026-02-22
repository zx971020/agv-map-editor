import { CANVAS_CONFIG, MAP_CONFIG, UI_CONFIG } from '@/config'

describe('CANVAS_CONFIG', () => {
  it('有默认画布尺寸', () => {
    expect(CANVAS_CONFIG.defaultWidth).toBe(1600)
    expect(CANVAS_CONFIG.defaultHeight).toBe(1200)
  })

  it('缩放配置合理', () => {
    expect(CANVAS_CONFIG.minZoom).toBeLessThan(CANVAS_CONFIG.defaultZoom)
    expect(CANVAS_CONFIG.maxZoom).toBeGreaterThan(CANVAS_CONFIG.defaultZoom)
    expect(CANVAS_CONFIG.defaultZoom).toBe(100)
    expect(CANVAS_CONFIG.zoomStep).toBeGreaterThan(0)
  })

  it('网格配置合理', () => {
    expect(CANVAS_CONFIG.gridSizes).toBeInstanceOf(Array)
    expect(CANVAS_CONFIG.gridSizes.length).toBeGreaterThan(0)
    expect(CANVAS_CONFIG.gridSizes).toContain(CANVAS_CONFIG.defaultGridSize)
    expect(typeof CANVAS_CONFIG.showGrid).toBe('boolean')
  })

  it('吸附配置合理', () => {
    expect(typeof CANVAS_CONFIG.snapToGrid).toBe('boolean')
    expect(CANVAS_CONFIG.snapThreshold).toBeGreaterThan(0)
  })
})

describe('MAP_CONFIG', () => {
  it('包含主地图和子地图类型', () => {
    expect(MAP_CONFIG.types.main).toBeDefined()
    expect(MAP_CONFIG.types.sub).toBeDefined()
    expect(MAP_CONFIG.types.main.label).toBe('主地图')
    expect(MAP_CONFIG.types.sub.label).toBe('子地图')
  })

  it('默认地图尺寸合理', () => {
    expect(MAP_CONFIG.defaultMainMapSize.mapWidth).toBeGreaterThan(0)
    expect(MAP_CONFIG.defaultMainMapSize.mapLength).toBeGreaterThan(0)
    expect(MAP_CONFIG.defaultSubMapSize.mapWidth).toBeGreaterThan(0)
    expect(MAP_CONFIG.defaultSubMapSize.mapLength).toBeGreaterThan(0)
  })

  it('主地图尺寸大于子地图', () => {
    expect(MAP_CONFIG.defaultMainMapSize.mapWidth).toBeGreaterThanOrEqual(
      MAP_CONFIG.defaultSubMapSize.mapWidth
    )
    expect(MAP_CONFIG.defaultMainMapSize.mapLength).toBeGreaterThanOrEqual(
      MAP_CONFIG.defaultSubMapSize.mapLength
    )
  })
})

describe('UI_CONFIG', () => {
  it('有默认工具', () => {
    expect(UI_CONFIG.defaultTool).toBe('select')
  })

  it('有提示文本', () => {
    expect(typeof UI_CONFIG.emptyCanvasHint).toBe('string')
    expect(UI_CONFIG.emptyCanvasHint.length).toBeGreaterThan(0)
    expect(typeof UI_CONFIG.noSelectionHint).toBe('string')
    expect(UI_CONFIG.noSelectionHint.length).toBeGreaterThan(0)
  })

  it('属性面板默认不折叠', () => {
    expect(UI_CONFIG.propertiesCollapsed).toBe(false)
  })
})
