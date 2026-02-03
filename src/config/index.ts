// AGV 地图编辑器配置文件
import type { ElementConfig, ElementType } from '@/types'

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

// 元素配置
export const ELEMENT_CONFIG: Record<ElementType, ElementConfig> = {
  workstation: { label: '工位', icon: '工', color: '#0066cc' },
  ai_station: { label: '人工工位', icon: '人', color: '#00aa66' },
  charging: { label: '充电站', icon: '充', color: '#ff9900' },
  elevator: { label: '机架升降', icon: '升', color: '#9933cc' },
  gate: { label: '门', icon: '门', color: '#cc3333' },
  parking: { label: '停车区', icon: '停', color: '#666666' },
  path: { label: '路径', icon: '线', color: '#333333' },
  dock: { label: '普通终点', icon: '终', color: '#0066cc' },
  shelf: { label: '货架', icon: '货', color: '#cc6600' },
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
