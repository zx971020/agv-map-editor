import { setActivePinia, createPinia } from 'pinia'
import { useMapStore } from '@/stores/mapStore'
import { useCanvasStore } from '@/stores/canvasStore'

describe('mapStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('初始状态', () => {
    it('地图列表为空', () => {
      const store = useMapStore()
      expect(store.maps).toEqual([])
    })

    it('无激活地图', () => {
      const store = useMapStore()
      expect(store.activeMapId).toBeNull()
      expect(store.activeMap).toBeNull()
    })

    it('无展开状态', () => {
      const store = useMapStore()
      expect(store.expandedMaps.size).toBe(0)
    })
  })

  describe('addMainMap', () => {
    it('添加主地图', () => {
      const store = useMapStore()
      const map = store.addMainMap('测试地图')

      expect(store.maps).toHaveLength(1)
      expect(map.name).toBe('测试地图')
      expect(map.type).toBe('main')
      expect(map.id).toBeDefined()
      expect(map.mapWidth).toBe(1600)
      expect(map.mapLength).toBe(1200)
      expect(map.nodeList).toEqual([])
      expect(map.lineList).toEqual([])
      expect(map.subMaps).toEqual([])
    })

    it('第一个地图自动激活', () => {
      const store = useMapStore()
      const map = store.addMainMap('第一个')

      expect(store.activeMapId).toBe(map.id)
      expect(store.activeMap?.name).toBe('第一个')
    })

    it('后续地图不自动激活', () => {
      const store = useMapStore()
      const first = store.addMainMap('第一个')
      store.addMainMap('第二个')

      expect(store.activeMapId).toBe(first.id)
    })

    it('无名称时自动命名', () => {
      const store = useMapStore()
      const map = store.addMainMap()
      expect(map.name).toBe('新地图 1')
    })

    it('自动命名递增', () => {
      const store = useMapStore()
      store.addMainMap()
      const second = store.addMainMap()
      expect(second.name).toBe('新地图 2')
    })
  })

  describe('addSubMap', () => {
    it('添加子地图到主地图', () => {
      const store = useMapStore()
      const parent = store.addMainMap('主地图')
      const sub = store.addSubMap(parent.id, '子地图A')

      expect(sub).not.toBeNull()
      expect(sub!.name).toBe('子地图A')
      expect(sub!.type).toBe('sub')
      expect(sub!.mainMapName).toBe('主地图')
      expect(sub!.mapWidth).toBe(800)
      expect(sub!.mapLength).toBe(600)
    })

    it('子地图添加到父地图的 subMaps', () => {
      const store = useMapStore()
      const parent = store.addMainMap('主地图')
      store.addSubMap(parent.id, '子A')
      store.addSubMap(parent.id, '子B')

      expect(parent.subMaps).toHaveLength(2)
    })

    it('自动展开父地图', () => {
      const store = useMapStore()
      const parent = store.addMainMap('主地图')
      store.addSubMap(parent.id)

      expect(store.expandedMaps.has(parent.id)).toBe(true)
    })

    it('父地图不存在返回 null', () => {
      const store = useMapStore()
      const result = store.addSubMap('nonexistent')
      expect(result).toBeNull()
    })

    it('无名称时自动命名', () => {
      const store = useMapStore()
      const parent = store.addMainMap('主地图')
      const sub = store.addSubMap(parent.id)
      expect(sub!.name).toBe('子地图 1')
    })
  })

  describe('findMapById', () => {
    it('查找主地图', () => {
      const store = useMapStore()
      const map = store.addMainMap('测试')
      expect(store.findMapById(map.id)).toEqual(map)
    })

    it('查找子地图', () => {
      const store = useMapStore()
      const parent = store.addMainMap('主地图')
      const sub = store.addSubMap(parent.id, '子地图')!
      expect(store.findMapById(sub.id)).toEqual(sub)
    })

    it('不存在返回 null', () => {
      const store = useMapStore()
      expect(store.findMapById('nonexistent')).toBeNull()
    })
  })

  describe('findParentMap', () => {
    it('查找子地图的父地图', () => {
      const store = useMapStore()
      const parent = store.addMainMap('主地图')
      const sub = store.addSubMap(parent.id, '子地图')!

      expect(store.findParentMap(sub.id)).toEqual(parent)
    })

    it('主地图没有父地图', () => {
      const store = useMapStore()
      const map = store.addMainMap('主地图')
      expect(store.findParentMap(map.id)).toBeNull()
    })

    it('不存在的 ID 返回 null', () => {
      const store = useMapStore()
      expect(store.findParentMap('nonexistent')).toBeNull()
    })
  })

  describe('renameMap', () => {
    it('重命名主地图', () => {
      const store = useMapStore()
      const map = store.addMainMap('旧名称')
      store.renameMap(map.id, '新名称')
      expect(map.name).toBe('新名称')
    })

    it('重命名主地图同步更新子地图的 mainMapName', () => {
      const store = useMapStore()
      const parent = store.addMainMap('主地图')
      const sub = store.addSubMap(parent.id, '子地图')!

      store.renameMap(parent.id, '新主地图名')
      expect(sub.mainMapName).toBe('新主地图名')
    })

    it('重命名子地图', () => {
      const store = useMapStore()
      const parent = store.addMainMap('主地图')
      const sub = store.addSubMap(parent.id, '旧子名')!

      store.renameMap(sub.id, '新子名')
      expect(sub.name).toBe('新子名')
    })

    it('不存在的 ID 无副作用', () => {
      const store = useMapStore()
      store.addMainMap('测试')
      store.renameMap('nonexistent', '新名称')
      expect(store.maps[0].name).toBe('测试')
    })
  })

  describe('deleteMap', () => {
    it('删除主地图', () => {
      const store = useMapStore()
      const map1 = store.addMainMap('地图1')
      store.addMainMap('地图2')
      store.deleteMap(map1.id)

      expect(store.maps).toHaveLength(1)
      expect(store.maps[0].name).toBe('地图2')
    })

    it('删除子地图', () => {
      const store = useMapStore()
      const parent = store.addMainMap('主地图')
      const sub = store.addSubMap(parent.id, '子地图')!
      store.deleteMap(sub.id)

      expect(parent.subMaps).toHaveLength(0)
    })

    it('删除当前激活地图后切换到第一个', () => {
      const store = useMapStore()
      const map1 = store.addMainMap('地图1')
      const map2 = store.addMainMap('地图2')

      // map1 是激活的（第一个自动激活）
      store.deleteMap(map1.id)
      expect(store.activeMapId).toBe(map2.id)
    })

    it('删除最后一个地图后清空状态', () => {
      const store = useMapStore()
      const map = store.addMainMap('唯一地图')
      store.deleteMap(map.id)

      expect(store.activeMapId).toBeNull()
      expect(store.maps).toHaveLength(0)

      const canvasStore = useCanvasStore()
      expect(canvasStore.nodes).toEqual([])
      expect(canvasStore.pathLines).toEqual([])
    })

    it('删除非激活地图不影响当前激活', () => {
      const store = useMapStore()
      const map1 = store.addMainMap('地图1')
      const map2 = store.addMainMap('地图2')

      store.deleteMap(map2.id)
      expect(store.activeMapId).toBe(map1.id)
    })
  })

  describe('switchMap', () => {
    it('切换到另一个地图', () => {
      const store = useMapStore()
      const map1 = store.addMainMap('地图1')
      const map2 = store.addMainMap('地图2')

      expect(store.activeMapId).toBe(map1.id)
      store.switchMap(map2.id)
      expect(store.activeMapId).toBe(map2.id)
    })

    it('切换到当前地图无操作', () => {
      const store = useMapStore()
      const map = store.addMainMap('地图1')

      // 不应抛出错误
      store.switchMap(map.id)
      expect(store.activeMapId).toBe(map.id)
    })

    it('切换到不存在的地图无操作', () => {
      const store = useMapStore()
      const map = store.addMainMap('地图1')

      store.switchMap('nonexistent')
      expect(store.activeMapId).toBe(map.id)
    })

    it('切换时保存当前画布数据', () => {
      const store = useMapStore()
      const canvasStore = useCanvasStore()

      const map1 = store.addMainMap('地图1')
      const map2 = store.addMainMap('地图2')

      // 在 map1 上添加节点
      canvasStore.addNodeFromData({ type: 1, x: 100, y: 200 })
      expect(canvasStore.nodes).toHaveLength(1)

      // 切换到 map2
      store.switchMap(map2.id)

      // map1 应该保存了节点数据
      expect(map1.nodeList).toHaveLength(1)

      // map2 画布应该是空的
      expect(canvasStore.nodes).toHaveLength(0)
    })

    it('切换时加载目标地图数据', () => {
      const store = useMapStore()
      const canvasStore = useCanvasStore()

      const map1 = store.addMainMap('地图1')
      const map2 = store.addMainMap('地图2')

      // 在 map1 上添加节点
      canvasStore.addNodeFromData({ type: 1, x: 100, y: 200 })

      // 切换到 map2，再切回 map1
      store.switchMap(map2.id)
      store.switchMap(map1.id)

      // 应该恢复 map1 的节点
      expect(canvasStore.nodes).toHaveLength(1)
    })
  })

  describe('toggleExpand', () => {
    it('展开地图', () => {
      const store = useMapStore()
      const map = store.addMainMap('测试')
      store.toggleExpand(map.id)
      expect(store.expandedMaps.has(map.id)).toBe(true)
    })

    it('折叠已展开的地图', () => {
      const store = useMapStore()
      const map = store.addMainMap('测试')
      store.toggleExpand(map.id)
      store.toggleExpand(map.id)
      expect(store.expandedMaps.has(map.id)).toBe(false)
    })
  })

  describe('initDefaultMap', () => {
    it('空列表时创建默认地图', () => {
      const store = useMapStore()
      store.initDefaultMap()

      expect(store.maps).toHaveLength(1)
      expect(store.maps[0].name).toBe('默认地图')
      expect(store.activeMapId).toBe(store.maps[0].id)
    })

    it('已有地图时不创建', () => {
      const store = useMapStore()
      store.addMainMap('已有地图')
      store.initDefaultMap()

      expect(store.maps).toHaveLength(1)
      expect(store.maps[0].name).toBe('已有地图')
    })
  })

  describe('activeMap 计算属性', () => {
    it('无激活 ID 返回 null', () => {
      const store = useMapStore()
      expect(store.activeMap).toBeNull()
    })

    it('返回当前激活的地图', () => {
      const store = useMapStore()
      const map = store.addMainMap('测试')
      expect(store.activeMap).toEqual(map)
    })

    it('激活子地图', () => {
      const store = useMapStore()
      const parent = store.addMainMap('主地图')
      const sub = store.addSubMap(parent.id, '子地图')!

      store.switchMap(sub.id)
      expect(store.activeMap).toEqual(sub)
    })
  })
})
