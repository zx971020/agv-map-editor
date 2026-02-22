import request from '@/utils/request'

// 获取所有地图数据
export const getMapList = () =>
  request({
    url: '/map/getSimpleMapList',
    method: 'get',
  })

// 新建或更新地图
export const addOrUpdateMap = (data: unknown) =>
  request({
    url: '/map/upLoadMap',
    method: 'post',
    data,
  })

// 根据地图名称查询详细地图数据
export const getMapDetailByName = mapName =>
  request({
    url: `/map/getMapInfo/${mapName}`,
    method: 'get',
  })
