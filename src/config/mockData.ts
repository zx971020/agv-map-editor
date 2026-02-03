// 模拟数据 - 用于静态界面展示
import type { MapItem } from '@/types'

// 示例地图数据
export const MOCK_MAPS: MapItem[] = [
  {
    id: 'map-001',
    name: '主厂区总图',
    type: 'main',
    width: 1600,
    height: 1200,
    subMaps: [
      {
        id: 'map-001-sub-001',
        name: 'A区原料库',
        type: 'sub',
        width: 800,
        height: 600,
        linkPoints: 2,
      },
      {
        id: 'map-001-sub-002',
        name: 'B区生产线',
        type: 'sub',
        width: 1200,
        height: 800,
        linkPoints: 3,
      },
    ],
  },
  {
    id: 'map-002',
    name: '办公区测试',
    type: 'main',
    width: 800,
    height: 800,
  },
]
