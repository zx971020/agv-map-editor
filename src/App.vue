<template>
  <AppLayout>
    <!-- 左侧栏 -->
    <template #sidebar>
      <MapList />
      <ElementPanel />
    </template>

    <!-- 工作区 -->
    <template #workspace>
      <WorkspaceHeader />
      <CanvasToolbar />
      <CanvasArea />
      <BottomBar />
    </template>

    <!-- 属性栏 -->
    <template #properties>
      <PropertiesPanel />
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
import MapList from '@/components/sidebar/MapList.vue'
import ElementPanel from '@/components/sidebar/ElementPanel.vue'
import WorkspaceHeader from '@/components/workspace/WorkspaceHeader.vue'
import CanvasToolbar from '@/components/workspace/CanvasToolbar.vue'
import CanvasArea from '@/components/workspace/CanvasArea.vue'
import BottomBar from '@/components/workspace/BottomBar.vue'
import PropertiesPanel from '@/components/properties/PropertiesPanel.vue'
</script>
