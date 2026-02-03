<template>
  <div class="flex flex-col gap-2">
    <!-- 地图属性面板 -->
    <Panel title="地图属性" subtitle="基础尺寸">
      <div class="property-grid grid grid-cols-2 gap-2">
        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">宽度</span>
          <input
            type="number"
            value="800"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">长度</span>
          <input
            type="number"
            value="800"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">网格</span>
          <select
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          >
            <option>10 px</option>
            <option selected>20 px</option>
            <option>40 px</option>
          </select>
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">参考线</span>
          <select
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          >
            <option selected>开启</option>
            <option>关闭</option>
          </select>
        </label>
      </div>
    </Panel>

    <!-- 元素属性面板 -->
    <Panel title="元素属性" subtitle="未选择">
      <template #actions>
        <Button variant="ghost" size="xs">清除</Button>
      </template>

      <div class="property-grid grid grid-cols-2 gap-2">
        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">名称</span>
          <input
            type="text"
            placeholder="-"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">类型</span>
          <input
            type="text"
            disabled
            class="h-7 w-full rounded-sm border border-input bg-muted px-1.5 text-[13px] text-muted-foreground"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">X</span>
          <input
            type="number"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">Y</span>
          <input
            type="number"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">宽</span>
          <input
            type="number"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>

        <label class="property-item flex flex-col gap-0.5">
          <span class="text-xs text-dim">高</span>
          <input
            type="number"
            class="h-7 w-full rounded-sm border border-input bg-background px-1.5 text-[13px] text-foreground focus:border-ring focus:outline-none dark:bg-card"
          />
        </label>
      </div>
    </Panel>
  </div>
</template>

<script setup lang="ts">
import Panel from '@/components/common/Panel.vue'
import Button from '@/components/ui/Button.vue'
</script>
