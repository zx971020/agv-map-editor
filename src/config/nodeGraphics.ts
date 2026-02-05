/**
 * 节点图形属性默认值配置
 * 根据 type 获取默认的图形属性（width, height, rotation, label）
 */

import type { NodeGraphicProps } from '@/types'
import elementList from '@/assets/element-list.json'

/**
 * 节点图形默认值映射表
 * key: type（元素类型编号）
 * value: 图形属性默认值
 */
export const NODE_GRAPHIC_DEFAULTS: Record<number, NodeGraphicProps> = {
  1: { width: 50, height: 50, rotation: 0, label: '工位' },
  2: { width: 50, height: 50, rotation: 0, label: '人工工位' },
  3: { width: 60, height: 60, rotation: 0, label: '充电站' },
  4: { width: 55, height: 55, rotation: 0, label: '机械手' },
  5: { width: 40, height: 40, rotation: 0, label: '门' },
  6: { width: 50, height: 50, rotation: 0, label: '停靠区' },
  7: { width: 30, height: 30, rotation: 0, label: '普通路径点' },
  12: { width: 50, height: 50, rotation: 0, label: '货架' },
}

/**
 * 通用默认图形属性（类型未定义时使用）
 */
export const DEFAULT_GRAPHIC_PROPS: NodeGraphicProps = {
  width: 50,
  height: 50,
  rotation: 0,
  label: '未知节点',
}

/**
 * 根据 type 获取节点的图形属性默认值
 * @param type 元素类型编号
 * @returns 图形属性默认值
 */
export function getNodeGraphicDefaults(type: number): NodeGraphicProps {
  // 优先从配置表获取
  if (NODE_GRAPHIC_DEFAULTS[type]) {
    return { ...NODE_GRAPHIC_DEFAULTS[type] }
  }

  // 尝试从 element-list.json 获取 label
  const elementConfig = elementList.find(el => el.type === type)
  if (elementConfig) {
    return {
      ...DEFAULT_GRAPHIC_PROPS,
      label: elementConfig.name,
    }
  }

  // 返回通用默认值
  return { ...DEFAULT_GRAPHIC_PROPS }
}

/**
 * 根据 type 获取节点名称
 * @param type 元素类型编号
 * @returns 节点名称
 */
export function getNodeLabel(type: number): string {
  const elementConfig = elementList.find(el => el.type === type)
  return elementConfig?.name || NODE_GRAPHIC_DEFAULTS[type]?.label || '未知节点'
}
