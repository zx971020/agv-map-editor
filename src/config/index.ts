
// 画布配置
export const CANVAS_CONFIG = {
  // 默认画布尺寸
  defaultWidth: 1600,
  defaultHeight: 1200,

  // 缩放配置
  minZoom: 50,
  maxZoom: 200,
  defaultZoom: 100,
  zoomStep: 10,

  // 网格配置
  gridSizes: [10, 20, 40],
  defaultGridSize: 20,
  showGrid: true,

  // 参考线配置
  showGuides: true,
  guideColor: '#0066cc',

  // 吸附配置
  snapToGrid: false,
  snapThreshold: 5,
}


// 地图配置
export const MAP_CONFIG = {
  // 地图类型
  types: {
    main: { label: '主地图', icon: 'M' },
    sub: { label: '子地图', icon: 'S' },
  },

  // 默认地图尺寸
  defaultMainMapSize: { width: 1600, height: 1200 },
  defaultSubMapSize: { width: 800, height: 600 },
}

// UI 配置
export const UI_CONFIG = {
  // 属性面板
  propertiesCollapsed: false,

  // 工具栏
  defaultTool: 'select',

  // 提示文本
  emptyCanvasHint: '拖拽元素到画布开始编辑',
  noSelectionHint: '未选择',
}
