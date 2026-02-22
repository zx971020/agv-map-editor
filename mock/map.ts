import type { MockMethod } from 'vite-plugin-mock'

const mapList = [
  { mapName: '测试地图A', width: 1000, height: 800 },
  { mapName: '测试地图B', width: 1200, height: 900 },
  { mapName: '仓库地图', width: 2000, height: 1500 },
]

export default [
  {
    url: '/api/map/getSimpleMapList',
    method: 'get',
    response: () => ({
      code: 200,
      message: 'success',
      data: mapList,
    }),
  },
  {
    url: '/api/map/upLoadMap',
    method: 'post',
    response: ({ body }) => ({
      code: 200,
      message: 'success',
      data: body,
    }),
  },
  {
    url: '/api/map/getMapInfo/:mapName',
    method: 'get',
    response: ({ query }) => ({
      code: 200,
      message: 'success',
      data: {
        mapName: query.mapName || '测试地图A',
        width: 1000,
        height: 800,
        nodeList: [],
        pathList: [],
      },
    }),
  },
] as MockMethod[]
