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
  nodeAttr: string
  nodeType: string
}

// 地图类型
export type MapType = 'main' | 'sub'

// 地图项
export interface MapItem {
  id: string
  mapName: string
  type: MapType
  mapWidth: number
  mapLength: number
  nodeList: CanvasNode[]
  lineList: any[]
  mainMapName?:string // 主地图名称
  subMaps?: MapItem[]
}

/**
 * 节点业务数据（用于导入导出）
 * 不包含图形属性和前端运行时 ID
 */
export interface NodeData {
  node: number | string // 元素点编号（业务主键，可修改）
  type: number // 元素类型编号
  x: number // 笛卡尔坐标 X
  y: number // 笛卡尔坐标 Y（向上为正）
  leftStation: number // 左工位
  rightStation: number // 右工位
  nodeAttr: string // 节点属性（如 "COMMON"）
  nodeType: string // 节点类型（如 "LOAD", "PATH"）
  navigationMode: number // 导航模式 
  avoidable: 1 | 0 // 是否可避让
  enable:boolean // 充电点使能
  speed:number  // 速度
  dir:number   // 姿态方向
  floor: number|string  // 楼层
  regionName: string // 区域名称
  stationName: string // 站点名称
}

/**
 * 节点图形属性（不导出，使用默认值补充）
 * 根据 type 从配置中获取默认值
 */
export interface NodeGraphicProps {
  width: number // 宽度
  height: number // 高度
  rotation: number // 旋转角度（顺时针为正）
  label: string // 显示名称
}


/**
 * 路径线业务数据（用于导入导出）
 * 不包含图形属性和前端运行时 ID
 */
export interface PathData {
  type: 11 // 固定值，标识为路径线
  startNode: number // 起始节点编号
  endNode: number // 结束节点编号
  lineType: number // 路径类型：0=直线, 1=弧线
  distance: number // 路径距离（自动计算，只读）
  laneDir: number // 车道方向：0=单向, 1=双向
  speed: number // 速度限制
  positiveCourse: number // 正向航向角
  negativeCourse: number // 反向航向角
  carBodyPositiveCourse: number // 车体正向航向角
  carBodyNegativeCourse: number // 车体反向航向角
  cpx?: number // 控制点 X（仅弧线时存在）
  cpy?: number // 控制点 Y（仅弧线时存在）
}

/**
 * 路径线图形属性（不导出，使用默认值补充）
 * 根据 lineType 和 laneDir 从配置中获取默认值
 */
export interface PathGraphicProps {
  strokeColor: string // 线条颜色
  strokeWidth: number // 线条粗细
  showArrow: boolean // 是否显示箭头
  dash?: number[] // 虚线样式（可选）
}

/**
 * 画布路径线运行时数据（前端使用）
 * = 业务数据 + 图形属性 + 前端唯一 ID
 */
export interface CanvasPathLine extends PathData, PathGraphicProps {
  id: string // 前端唯一标识（UUID，不导出）
}

/**
 * 画布节点运行时数据（前端使用）
 * = 业务数据 + 图形属性 + 前端唯一 ID
 */
export interface CanvasNode extends NodeData, NodeGraphicProps {
  id: string // 前端唯一标识（UUID，不导出）
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
