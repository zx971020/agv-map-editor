// AGV 地图编辑器类型定义

// 元素类型
export type ElementType =
  | 'workstation'
  | 'ai_station'
  | 'charging'
  | 'elevator'
  | 'gate'
  | 'parking'
  | 'path'
  | 'dock'
  | 'shelf'

// 元素配置
export interface ElementConfig {
  label: string
  icon: string
  color: string
}

// 元素列表项（来自 element-list.json）
export interface ElementListItem {
  icon: string
  name: string
  type: number
  nodeAttr?: string
  nodeType?: string
  avoidable?: number
}


// 地图类型
export type MapType = 'main' | 'sub'

// 地图项
export interface MapItem {
  id: string
  name: string
  type: MapType
  width: number
  height: number
  subMaps?: MapItem[]
  linkPoints?: number
}

// 画布元素（旧版，保留兼容）
export interface CanvasElement {
  id: string
  type: ElementType
  label: string
  x: number
  y: number
  width: number
  height: number
}

// 画布节点元素（笛卡尔坐标系）
export interface CanvasNode {
  id: string
  type: number // 元素类型编号
  label: string
  x: number // 笛卡尔坐标 X
  y: number // 笛卡尔坐标 Y（向上为正）
  width: number
  height: number
  rotation: number // 顺时针为正
  nodeAttr?: string
  nodeType?: string
  avoidable?: number
  data?: Record<string, any>
}

// 画布路径元素
export interface CanvasPath {
  id: string
  points: number[] // [x1, y1, x2, y2, ...] 笛卡尔坐标
  style: PathStyle
}

export interface PathStyle {
  stroke: string
  strokeWidth: number
  dash?: number[]
  arrow?: boolean
}

// 网格配置
export interface GridConfig {
  show: boolean
  size: number // 基础网格大小
  snapToGrid: boolean
  snapThreshold: number
}

// 标尺配置
export interface RulerConfig {
  show: boolean
  size: number // 标尺宽度/高度（像素）
  interval: number // 刻度间隔
}

// 画布视图配置（用于无极缩放和平移）
export interface CanvasViewport {
  x: number // Stage 偏移 X
  y: number // Stage 偏移 Y
  scale: number // 缩放比例
}

// 工具类型
export type ToolType = 'select' | 'path' | 'area' | 'pan'
