/**
 * 路径线图形属性默认值配置
 * 根据 lineType 和 laneDir 获取默认的图形属性
 */

import type { PathGraphicProps } from '@/types'

/**
 * 基础样式配置（根据 lineType）
 */
const BASE_STYLES: Record<number, Partial<PathGraphicProps>> = {
  0: {
    // 直线
    strokeWidth: 2,
    dash: undefined,
  },
  1: {
    // 弧线
    strokeWidth: 2,
    dash: [5, 5], // 虚线样式，便于区分
  },
}

/**
 * 方向样式配置（根据 laneDir）
 */
const DIRECTION_STYLES: Record<number, Partial<PathGraphicProps>> = {
  0: {
    // 单向
    strokeColor: '#10b981', // 绿色
    showArrow: true,
  },
  1: {
    // 双向
    strokeColor: '#3b82f6', // 蓝色
    showArrow: false, // 双向不显示箭头
  },
}

/**
 * 默认图形属性
 */
export const DEFAULT_PATH_GRAPHIC: PathGraphicProps = {
  strokeColor: '#3b82f6',
  strokeWidth: 2,
  showArrow: false,
}

/**
 * 根据路径数据获取图形属性
 * @param lineType 路径类型：0=直线, 1=弧线
 * @param laneDir 车道方向：0=单向, 1=双向
 * @returns 图形属性默认值
 */
export function getPathGraphicDefaults(
  lineType: number,
  laneDir: number
): PathGraphicProps {
  return {
    ...DEFAULT_PATH_GRAPHIC,
    ...BASE_STYLES[lineType],
    ...DIRECTION_STYLES[laneDir],
  }
}
