/**
 * 节点数据转换工具
 * 处理业务数据与运行时数据之间的转换
 */

import type { NodeData, CanvasNode } from '@/types'
import { getNodeGraphicDefaults } from '@/config/nodeGraphics'

/**
 * 生成唯一 ID
 * 使用 crypto.randomUUID()，如不支持则使用备用方案
 */
export function generateNodeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // 备用方案
  return `node_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * 导入节点数据，转换为运行时格式
 * 添加前端唯一 ID 和默认图形属性
 *
 * @param importData 导入的业务数据
 * @returns 运行时节点数据（包含 id 和完整图形属性）
 */
export function importNodes(importData: NodeData[]): CanvasNode[] {
  return importData.map(data => {
    // 获取默认图形属性
    const graphicDefaults = getNodeGraphicDefaults(data.type)

    return {
      id: generateNodeId(),
      ...data,
      ...graphicDefaults,
    }
  })
}

/**
 * 导入单个节点数据
 *
 * @param data 业务数据
 * @returns 运行时节点数据
 */
export function importNode(data: NodeData): CanvasNode {
  const graphicDefaults = getNodeGraphicDefaults(data.type)

  return {
    id: generateNodeId(),
    ...data,
    ...graphicDefaults,
  }
}

/**
 * 导出节点数据，移除前端运行时属性和图形属性
 *
 * @param nodes 运行时节点数据
 * @returns 业务数据（不包含 id 和图形属性）
 */
export function exportNodes(nodes: CanvasNode[]): NodeData[] {
  return nodes.map(exportNode)
}

/**
 * 导出单个节点数据
 *
 * @param node 运行时节点数据
 * @returns 业务数据
 */
export function exportNode(node: CanvasNode): NodeData {
  const { id, width, height, rotation, label, ...nodeData } = node
  return nodeData
}

/**
 * 生成唯一的节点编号
 * 查找当前所有节点中最大的编号，然后加1
 *
 * @param existingNodes 现有节点列表
 * @returns 新的唯一节点编号
 */
export function generateUniqueNodeNumber(existingNodes: CanvasNode[]): number {
  if (existingNodes.length === 0) {
    return 1 // 如果没有节点，从1开始
  }

  // 找到最大的节点编号
  const maxNodeNumber = Math.max(
    ...existingNodes.map(n => {
      const nodeNum = typeof n.node === 'number' ? n.node : parseInt(String(n.node), 10)
      return isNaN(nodeNum) ? 0 : nodeNum
    })
  )

  return maxNodeNumber + 1
}

/**
 * 创建新节点（用于画布上添加新元素）
 *
 * @param partialData 部分业务数据（至少包含 type, x, y）
 * @param existingNodes 现有节点列表（用于生成唯一编号）
 * @returns 完整的运行时节点数据
 */
export function createNode(
  partialData: Pick<NodeData, 'type' | 'x' | 'y'> & Partial<NodeData>,
  existingNodes: CanvasNode[] = []
): CanvasNode {
  const graphicDefaults = getNodeGraphicDefaults(partialData.type)

  // 业务数据默认值
  const nodeDataDefaults: NodeData = {
    node: generateUniqueNodeNumber(existingNodes), // 自动生成唯一编号
    type: partialData.type,
    x: partialData.x,
    y: partialData.y,
    leftStation: 0,
    rightStation: '',
    nodeAttr: 'COMMON',
    nodeType: 'PATH',
    navigationMode: 0,
    avoidable: 1,
    enable: false, // 充电点使能
    speed: 1000, // 速度
    dir: 0, // 姿态方向
    floor: 1, // 楼层
    regionName: '', // 区域名称
    stationName: '', // 站点名称
  }

  return {
    id: generateNodeId(),
    ...nodeDataDefaults,
    ...partialData,
    ...graphicDefaults,
  }
}
