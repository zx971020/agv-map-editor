import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MapItem } from '@/types'
import { useCanvasStore } from './canvasStore'

export const useMapStore = defineStore('map', () => {
  // 地图列表
  const maps = ref<MapItem[]>([])

  // 当前激活的地图 ID
  const activeMapId = ref<string | null>(null)

  // 展开的地图集合（用于 UI 折叠状态）
  const expandedMaps = ref<Set<string>>(new Set())

  // 计算属性：当前激活的地图
  const activeMap = computed(() => {
    if (!activeMapId.value) return null
    return findMapById(activeMapId.value)
  })

  // 递归查找地图（包括子地图）
  const findMapById = (id: string): MapItem | null => {
    for (const map of maps.value) {
      if (map.id === id) return map
      if (map.subMaps) {
        const sub = map.subMaps.find(s => s.id === id)
        if (sub) return sub
      }
    }
    return null
  }

  // 查找子地图所属的主地图
  const findParentMap = (subMapId: string): MapItem | null => {
    for (const map of maps.value) {
      if (map.subMaps?.some(s => s.id === subMapId)) {
        return map
      }
    }
    return null
  }

  // 生成唯一 ID
  const generateId = (): string => {
    return `map-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  }

  // 保存当前画布数据到当前地图
  const saveCurrentMapData = () => {
    if (!activeMapId.value) return
    const map = findMapById(activeMapId.value)
    if (!map) return

    const canvasStore = useCanvasStore()
    map.nodeList = [...canvasStore.nodes]
    map.lineList = [...canvasStore.pathLines]
  }

  // 加载地图数据到画布
  const loadMapToCanvas = (map: MapItem) => {
    const canvasStore = useCanvasStore()
    canvasStore.clearSelection()
    canvasStore.nodes = map.nodeList ? [...map.nodeList] : []
    canvasStore.pathLines = map.lineList ? [...map.lineList] : []
  }

  // 切换地图
  const switchMap = (mapId: string) => {
    if (mapId === activeMapId.value) return

    const targetMap = findMapById(mapId)
    if (!targetMap) return

    // 保存当前地图数据
    saveCurrentMapData()

    // 切换到目标地图
    activeMapId.value = mapId
    loadMapToCanvas(targetMap)
  }

  // 新增主地图
  const addMainMap = (name?: string): MapItem => {
    const id = generateId()
    const newMap: MapItem = {
      id,
      name: name || `新地图 ${maps.value.length + 1}`,
      type: 'main',
      mapWidth: 1600,
      mapLength: 1200,
      nodeList: [],
      lineList: [],
      subMaps: [],
    }
    maps.value.push(newMap)

    // 如果是第一个地图，自动激活
    if (maps.value.length === 1) {
      activeMapId.value = id
      loadMapToCanvas(newMap)
    }

    return newMap
  }

  // 新增子地图
  const addSubMap = (parentId: string, name?: string): MapItem | null => {
    const parent = maps.value.find(m => m.id === parentId)
    if (!parent) return null

    if (!parent.subMaps) {
      parent.subMaps = []
    }

    const id = generateId()
    const newSubMap: MapItem = {
      id,
      name: name || `子地图 ${parent.subMaps.length + 1}`,
      type: 'sub',
      mapWidth: 800,
      mapLength: 600,
      mainMapName: parent.name,
      nodeList: [],
      lineList: [],
    }
    parent.subMaps.push(newSubMap)

    // 自动展开父地图
    expandedMaps.value.add(parentId)

    return newSubMap
  }

  // 重命名地图
  const renameMap = (mapId: string, newName: string) => {
    const map = findMapById(mapId)
    if (!map) return
    map.name = newName

    // 如果是主地图，更新子地图的 mainMapName
    if (map.type === 'main' && map.subMaps) {
      map.subMaps.forEach(sub => {
        sub.mainMapName = newName
      })
    }
  }

  // 删除地图
  const deleteMap = (mapId: string) => {
    // 检查是否是子地图
    const parent = findParentMap(mapId)
    if (parent && parent.subMaps) {
      parent.subMaps = parent.subMaps.filter(s => s.id !== mapId)
    } else {
      maps.value = maps.value.filter(m => m.id !== mapId)
    }

    // 如果删除的是当前激活的地图，切换到第一个地图
    if (activeMapId.value === mapId) {
      const firstMap = maps.value[0]
      if (firstMap) {
        activeMapId.value = firstMap.id
        loadMapToCanvas(firstMap)
      } else {
        activeMapId.value = null
        const canvasStore = useCanvasStore()
        canvasStore.nodes = []
        canvasStore.pathLines = []
      }
    }
  }

  // 切换子地图展开/折叠
  const toggleExpand = (mapId: string) => {
    if (expandedMaps.value.has(mapId)) {
      expandedMaps.value.delete(mapId)
    } else {
      expandedMaps.value.add(mapId)
    }
  }

  // 初始化：添加一个默认主地图
  const initDefaultMap = () => {
    if (maps.value.length === 0) {
      addMainMap('默认地图')
    }
  }

  return {
    // 状态
    maps,
    activeMapId,
    expandedMaps,

    // 计算属性
    activeMap,

    // 方法
    findMapById,
    findParentMap,
    switchMap,
    addMainMap,
    addSubMap,
    renameMap,
    deleteMap,
    toggleExpand,
    saveCurrentMapData,
    loadMapToCanvas,
    initDefaultMap,
  }
})
