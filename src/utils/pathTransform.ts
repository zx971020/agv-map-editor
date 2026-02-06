/**
 * 路径线数据转换工具
 * 处理业务数据与运行时数据之间的转换
 */

import type { PathData, CanvasPathLine } from '@/types'
import { getPathGraphicDefaults } from '@/config/pathGraphics'

/**
 * 生成唯一 ID
 * 使用 crypto.randomUUID()，如不支持则使用备用方案
 */
export function generatePathId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // 备用方案
  return `path_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * 计算两点之间的欧几里得距离
 * @param x1 起点 X 坐标
 * @param y1 起点 Y 坐标
 * @param x2 终点 X 坐标
 * @param y2 终点 Y 坐标
 * @returns 距离值
 */
export function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

/**
 * 导入路径数据，转换为运行时格式
 * 添加前端唯一 ID 和默认图形属性
 *
 * @param importData 导入的业务数据
 * @returns 运行时路径数据（包含 id 和完整图形属性）
 */
export function importPaths(importData: PathData[]): CanvasPathLine[] {
  return importData.map(data => {
    // 获取默认图形属性
    const graphicDefaults = getPathGraphicDefaults(data.lineType, data.laneDir)

    return {
      id: generatePathId(),
      ...data,
      ...graphicDefaults,
    }
  })
}

/**
 * 导入单个路径数据
 *
 * @param data 业务数据
 * @returns 运行时路径数据
 */
export function importPath(data: PathData): CanvasPathLine {
  const graphicDefaults = getPathGraphicDefaults(data.lineType, data.laneDir)

  return {
    id: generatePathId(),
    ...data,
    ...graphicDefaults,
  }
}

/**
 * 导出路径数据，移除前端运行时属性和图形属性
 *
 * @param paths 运行时路径数据
 * @returns 业务数据（不包含 id 和图形属性）
 */
export function exportPaths(paths: CanvasPathLine[]): PathData[] {
  return paths.map(exportPath)
}

/**
 * 导出单个路径数据
 *
 * @param path 运行时路径数据
 * @returns 业务数据
 */
export function exportPath(path: CanvasPathLine): PathData {
  const { id, strokeColor, strokeWidth, showArrow, dash, ...pathData } = path
  return pathData
}

/**
 * 创建新路径（用于表单提交）
 * 自动计算距离并添加图形属性
 *
 * @param pathData 路径业务数据（不包含 type 和 distance）
 * @param startX 起始节点 X 坐标
 * @param startY 起始节点 Y 坐标
 * @param endX 结束节点 X 坐标
 * @param endY 结束节点 Y 坐标
 * @returns 完整的运行时路径数据
 */
export function createPath(
  pathData: Omit<PathData, 'type' | 'distance'>,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): CanvasPathLine {
  const graphicDefaults = getPathGraphicDefaults(pathData.lineType, pathData.laneDir)

  // 自动计算距离
  const distance = calculateDistance(startX, startY, endX, endY)

  return {
    id: generatePathId(),
    type: 11,
    distance,
    ...pathData,
    ...graphicDefaults,
  }
}
