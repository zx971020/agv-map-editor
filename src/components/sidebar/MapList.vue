<template>
  <Panel title="地图列表">
    <template #actions>
      <el-button text circle size="small" title="新增主地图" @click="handleAddMainMap">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </el-button>
    </template>

    <!-- 空状态 -->
    <div v-if="mapStore.maps.length === 0" class="flex flex-col items-center gap-2 py-8">
      <div class="text-sm text-muted-foreground">暂无地图</div>
      <el-button type="primary" size="small" @click="handleAddMainMap">新增地图</el-button>
    </div>

    <!-- 地图列表 -->
    <div v-else class="flex flex-col gap-2">
      <div v-for="map in mapStore.maps" :key="map.id" class="map-group">
        <!-- 主地图 -->
        <div
          class="group flex cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-background p-3 transition-all hover:border-primary/50 hover:bg-accent/50"
          :class="{ 'border-primary bg-primary/10': map.id === mapStore.activeMapId }"
          @click="handleSwitchMap(map.id)"
        >
          <!-- 地图图标 -->
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold bg-primary text-primary-foreground"
          >
            M
          </div>

          <!-- 地图信息 -->
          <div class="min-w-0 flex-1">
            <!-- 编辑模式 -->
            <el-input
              v-if="editingMapId === map.id"
              ref="editInputRef"
              v-model="editingName"
              size="small"
              @blur="confirmRename(map.id)"
              @keyup.enter="confirmRename(map.id)"
              @keyup.escape="cancelRename"
              @click.stop
            />
            <!-- 显示模式 -->
            <div
              v-else
              class="text-sm font-semibold text-foreground"
              @dblclick.stop="startRename(map)"
            >
              {{ map.name }}
            </div>
            <div v-if="editingMapId !== map.id" class="mt-1 text-xs text-muted-foreground">
              {{ map.mapWidth }} × {{ map.mapLength }}
              <span v-if="map.subMaps && map.subMaps.length > 0">
                · {{ map.subMaps.length }} 个子图
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div
            class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <!-- 新增子地图 -->
            <el-button
              text
              circle
              size="small"
              title="新增子地图"
              @click.stop="handleAddSubMap(map.id)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-3.5 h-3.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </el-button>

            <!-- 删除地图 -->
            <el-button text circle size="small" title="删除地图" @click.stop="handleDeleteMap(map)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-3.5 h-3.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </el-button>
          </div>

          <!-- 折叠按钮 -->
          <el-button
            v-if="map.subMaps && map.subMaps.length > 0"
            text
            circle
            size="small"
            :title="mapStore.expandedMaps.has(map.id) ? '折叠' : '展开'"
            @click.stop="mapStore.toggleExpand(map.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-3.5 h-3.5 transition-transform"
              :class="{ 'rotate-180': mapStore.expandedMaps.has(map.id) }"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </el-button>
        </div>

        <!-- 子地图列表 -->
        <div
          v-if="map.subMaps && map.subMaps.length > 0 && mapStore.expandedMaps.has(map.id)"
          class="ml-6 mt-2 flex flex-col gap-2 border-l-2 border-border pl-4"
        >
          <div
            v-for="subMap in map.subMaps"
            :key="subMap.id"
            class="group flex cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-background p-2.5 transition-all hover:border-primary/50 hover:bg-accent/50"
            :class="{ 'border-primary bg-primary/10': subMap.id === mapStore.activeMapId }"
            @click="handleSwitchMap(subMap.id)"
          >
            <!-- 子地图图标 -->
            <div
              class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-secondary-foreground"
            >
              S
            </div>

            <!-- 子地图信息 -->
            <div class="min-w-0 flex-1">
              <!-- 编辑模式 -->
              <el-input
                v-if="editingMapId === subMap.id"
                ref="editInputRef"
                v-model="editingName"
                size="small"
                @blur="confirmRename(subMap.id)"
                @keyup.enter="confirmRename(subMap.id)"
                @keyup.escape="cancelRename"
                @click.stop
              />
              <!-- 显示模式 -->
              <div
                v-else
                class="text-sm font-medium text-foreground"
                @dblclick.stop="startRename(subMap)"
              >
                {{ subMap.name }}
              </div>
              <div v-if="editingMapId !== subMap.id" class="mt-0.5 text-xs text-muted-foreground">
                {{ subMap.mapWidth }} × {{ subMap.mapLength }}
                <span v-if="subMap.linkPoints"> · {{ subMap.linkPoints }} 个关联点</span>
              </div>
            </div>

            <!-- 子地图操作按钮 -->
            <div
              class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <el-button
                text
                circle
                size="small"
                title="删除子地图"
                @click.stop="handleDeleteMap(subMap)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-3.5 h-3.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import Panel from '@/components/common/Panel.vue'
import { useMapStore } from '@/stores/mapStore'
import { ElMessageBox } from 'element-plus'
import type { MapItem } from '@/types'

const mapStore = useMapStore()

// 编辑状态
const editingMapId = ref<string | null>(null)
const editingName = ref('')
const editInputRef = ref<InstanceType<(typeof import('element-plus'))['ElInput']>[] | null>(null)

// 初始化默认地图
mapStore.initDefaultMap()

// 新增主地图
const handleAddMainMap = () => {
  const newMap = mapStore.addMainMap()
  // 自动进入编辑模式
  startRename(newMap)
}

// 新增子地图
const handleAddSubMap = (parentId: string) => {
  const newSubMap = mapStore.addSubMap(parentId)
  if (newSubMap) {
    // 自动进入编辑模式
    startRename(newSubMap)
  }
}

// 切换地图
const handleSwitchMap = (mapId: string) => {
  // 如果正在编辑名称，不切换
  if (editingMapId.value) return
  mapStore.switchMap(mapId)
}

// 开始重命名
const startRename = (map: MapItem) => {
  editingMapId.value = map.id
  editingName.value = map.name
  nextTick(() => {
    if (editInputRef.value && editInputRef.value.length > 0) {
      editInputRef.value[0].focus()
    }
  })
}

// 确认重命名
const confirmRename = (mapId: string) => {
  const trimmed = editingName.value.trim()
  if (trimmed) {
    mapStore.renameMap(mapId, trimmed)
  }
  editingMapId.value = null
  editingName.value = ''
}

// 取消重命名
const cancelRename = () => {
  editingMapId.value = null
  editingName.value = ''
}

// 删除地图
const handleDeleteMap = async (map: MapItem) => {
  const isMain = map.type === 'main'
  const hasSubMaps = isMain && map.subMaps && map.subMaps.length > 0
  const message = hasSubMaps
    ? `确定删除主地图「${map.name}」及其 ${map.subMaps!.length} 个子地图吗？`
    : `确定删除地图「${map.name}」吗？`

  try {
    await ElMessageBox.confirm(message, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    mapStore.deleteMap(map.id)
  } catch {
    // 用户取消
  }
}
</script>
