<template>
  <Panel title="地图列表">
    <template #actions>
      <IconButton variant="ghost" size="sm" title="新增地图">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </IconButton>
    </template>

    <!-- 地图列表 - 现代化设计 -->
    <div class="flex flex-col gap-2">
      <div v-for="map in maps" :key="map.id" class="map-group">
        <!-- 主地图 -->
        <div
          class="group flex cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-background p-3 transition-all hover:border-primary/50 hover:bg-accent/50"
          :class="{ 'border-primary bg-primary/10': map.id === activeMapId }"
        >
          <!-- 地图图标 -->
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-all"
            :class="
              map.type === 'main'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            "
          >
            {{ map.type === 'main' ? 'M' : 'S' }}
          </div>

          <!-- 地图信息 -->
          <div class="min-w-0 flex-1">
            <div class="text-sm font-semibold text-foreground">
              {{ map.name }}
            </div>
            <div class="mt-1 text-xs text-muted-foreground">
              {{ map.width }} × {{ map.height }}
              <span v-if="map.subMaps && map.subMaps.length > 0">
                · {{ map.subMaps.length }} 个子图</span
              >
            </div>
          </div>

          <!-- 折叠按钮 -->
          <IconButton
            v-if="map.subMaps && map.subMaps.length > 0"
            variant="ghost"
            size="sm"
            :title="expandedMaps.has(map.id) ? '折叠' : '展开'"
            @click.stop="toggleSubMaps(map.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="transition-transform"
              :class="{ 'rotate-180': expandedMaps.has(map.id) }"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </IconButton>
        </div>

        <!-- 子地图列表 -->
        <div
          v-if="map.subMaps && map.subMaps.length > 0 && expandedMaps.has(map.id)"
          class="ml-6 mt-2 flex flex-col gap-2 border-l-2 border-border pl-4 animate-in"
        >
          <div
            v-for="subMap in map.subMaps"
            :key="subMap.id"
            class="group flex cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-background p-2.5 transition-all hover:border-primary/50 hover:bg-accent/50"
            :class="{ 'border-primary bg-primary/10': subMap.id === activeMapId }"
          >
            <!-- 子地图图标 -->
            <div
              class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-secondary-foreground"
            >
              S
            </div>

            <!-- 子地图信息 -->
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium text-foreground">
                {{ subMap.name }}
              </div>
              <div class="mt-0.5 text-xs text-muted-foreground">
                {{ subMap.width }} × {{ subMap.height }}
                <span v-if="subMap.linkPoints"> · {{ subMap.linkPoints }} 个关联点</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Panel from '@/components/common/Panel.vue'
import IconButton from '@/components/ui/IconButton.vue'
import { MOCK_MAPS } from '@/config/mockData'
import type { MapItem } from '@/types'

// 地图数据
const maps = ref<MapItem[]>(MOCK_MAPS)

// 当前激活的地图
const activeMapId = ref('map-001')

// 展开的地图集合
const expandedMaps = ref<Set<string>>(new Set(['map-001']))

// 切换子地图展开/折叠
const toggleSubMaps = (mapId: string) => {
  if (expandedMaps.value.has(mapId)) {
    expandedMaps.value.delete(mapId)
  } else {
    expandedMaps.value.add(mapId)
  }
}
</script>
