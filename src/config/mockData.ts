// 模拟数据 - 用于静态界面展示
import type { MapItem } from '@/types'

// 示例地图数据（可选，用于初始化 mapStore）
export const INITIAL_MAPS: MapItem[] = [
  {
    id: 'map-001',
    name: '主厂区总图',
    type: 'main',
    mapWidth: 1600,
    mapLength: 1200,
    nodeList: [],
    lineList: [],
    subMaps: [
      {
        id: 'map-001-sub-001',
        name: 'A区原料库',
        type: 'sub',
        mapWidth: 800,
        mapLength: 600,
        mainMapName: '主厂区总图',
        linkPoints: 2,
        nodeList: [],
        lineList: [],
      },
      {
        id: 'map-001-sub-002',
        name: 'B区生产线',
        type: 'sub',
        mapWidth: 1200,
        mapLength: 800,
        mainMapName: '主厂区总图',
        linkPoints: 3,
        nodeList: [],
        lineList: [],
      },
    ],
  },
  {
    id: 'map-002',
    name: '办公区测试',
    type: 'main',
    mapWidth: 800,
    mapLength: 800,
    nodeList: [],
    lineList: [],
  },
]
