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

// 画布元素
export interface CanvasElement {
  id: string
  type: ElementType
  label: string
  x: number
  y: number
  width: number
  height: number
}

// 工具类型
export type ToolType = 'select' | 'path' | 'area'
