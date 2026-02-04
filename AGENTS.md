# AGENTS.md - AGV 地图编辑器开发指南

本文档为在 AGV 地图编辑器项目中工作的 AI 代理提供编码指南和约定。

## 项目概述

AGV 地图编辑器是一个基于 Web 的可视化编辑器，用于创建和管理 AGV（自动导引车）地图，支持分层地图结构、拖放元素放置和现代化 UI 设计。

**技术栈：** Vue 3 (Composition API) + TypeScript + Vite + Konva.js + Tailwind CSS + Pinia  
**语言：** 中文（zh-CN）用于 UI 文本和注释  
**目标：** 支持现代浏览器（Chrome、Edge、Firefox、Safari）

## 项目结构

```
agv-map-editor/
├── src/
│   ├── components/       # Vue 组件
│   │   ├── layout/      # 布局组件
│   │   ├── sidebar/     # 侧边栏组件（地图列表、元素面板）
│   │   ├── workspace/   # 工作区组件（画布、工具栏）
│   │   └── properties/  # 属性面板组件
│   ├── composables/     # Vue Composables（可复用逻辑）
│   ├── config/          # 配置文件
│   ├── lib/             # 工具函数
│   ├── types/           # TypeScript 类型定义
│   ├── assets/          # 静态资源（图片、JSON）
│   ├── App.vue          # 根组件
│   └── main.ts          # 应用入口
├── prototype/           # 原型代码（原生 JS 版本）
└── AGENTS.md            # 本文件
```

## 构建/检查/测试命令

### 开发

```bash
npm run dev              # 启动开发服务器（http://localhost:3000）
```

### 构建

```bash
npm run build            # 类型检查 + 生产构建
vue-tsc                  # 仅运行 TypeScript 类型检查
```

### 代码质量

```bash
npm run lint             # 运行 ESLint 并自动修复
npm run format           # 使用 Prettier 格式化代码
```

### 测试

**注意：** 目前项目没有自动化测试套件。测试通过浏览器手动进行。

## 代码风格指南

### TypeScript 风格

#### 命名约定

- **变量/函数：** `camelCase`（例如：`canvasWidth`、`updateSelection`）
- **类型/接口：** `PascalCase`（例如：`ElementType`、`MapItem`）
- **常量：** `UPPER_SNAKE_CASE`（例如：`CANVAS_CONFIG`、`DEFAULT_WIDTH`）
- **组件文件：** `PascalCase.vue`（例如：`CanvasArea.vue`）
- **CSS 类名：** Tailwind 工具类 + `kebab-case` 自定义类

#### 类型定义

```typescript
// 优先使用 type 定义联合类型
export type ElementType = 'workstation' | 'charging' | 'elevator'

// 使用 interface 定义对象结构
export interface MapItem {
  id: string
  name: string
  type: MapType
  width: number
  height: number
}

// 避免使用 any，使用 unknown 或具体类型
const data: unknown = fetchData()
```

#### 变量声明

```typescript
// 默认使用 const
const canvasWidth = ref(800)

// 仅在需要重新赋值时使用 let
let isDragging = false

// 完全避免使用 var
```

### Vue 3 风格

#### 组件结构（推荐顺序）

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 1. 导入
import { ref, computed, onMounted } from 'vue'
import type { MapItem } from '@/types'

// 2. Props 和 Emits
const props = defineProps<{
  mapId: string
}>()

const emit = defineEmits<{
  update: [value: string]
}>()

// 3. 响应式状态
const count = ref(0)

// 4. 计算属性
const doubled = computed(() => count.value * 2)

// 5. 方法
const increment = () => {
  count.value++
}

// 6. 生命周期钩子
onMounted(() => {
  // 初始化逻辑
})
</script>

<style scoped>
/* 组件样式 */
</style>
```

#### Composables 模式

```typescript
// src/composables/useDarkMode.ts
import { ref, onMounted } from 'vue'

export function useDarkMode() {
  const isDark = ref(false)

  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  onMounted(() => {
    // 初始化逻辑
  })

  return {
    isDark,
    toggleDarkMode,
  }
}
```

### 导入规范

#### 导入顺序

```typescript
// 1. Vue 核心
import { ref, computed, onMounted } from 'vue'

// 2. 第三方库
import { useVueKonva } from 'vue-konva'

// 3. 类型导入（使用 type 关键字）
import type { ElementType, MapItem } from '@/types'

// 4. 组件导入
import CanvasArea from '@/components/workspace/CanvasArea.vue'

// 5. Composables
import { useDarkMode } from '@/composables/useDarkMode'

// 6. 工具函数
import { cn } from '@/lib/utils'

// 7. 配置和常量
import { CANVAS_CONFIG } from '@/config'
```

#### 路径别名

```typescript
// 使用 @ 别名引用 src 目录
import { ElementType } from '@/types'
import CanvasArea from '@/components/workspace/CanvasArea.vue'

// 避免相对路径（除非同目录）
// ❌ import { utils } from '../../../lib/utils'
// ✅ import { utils } from '@/lib/utils'
```

### Tailwind CSS 风格

#### 类名组织

```vue
<template>
  <!-- 按功能分组：布局 → 尺寸 → 外观 → 交互 → 响应式 -->
  <div
    class="flex flex-col items-center gap-4 w-full h-screen bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
  >
    <!-- 内容 -->
  </div>
</template>
```

#### 使用 cn() 工具函数

```typescript
import { cn } from '@/lib/utils'

// 条件类名合并
const buttonClass = cn(
  'px-4 py-2 rounded-lg',
  isActive && 'bg-primary text-white',
  isDisabled && 'opacity-50 cursor-not-allowed'
)
```

### 错误处理

```typescript
// 使用守卫子句提前返回
if (!data) return
if (event.button !== 0) return

// 类型安全的错误处理
try {
  const result = await fetchData()
  // 处理结果
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message)
  }
}

// 可选链和空值合并
const value = data?.property ?? defaultValue
```

### 注释规范

```typescript
// 简短说明使用单行注释（中文）
// 更新画布缩放比例

/**
 * 复杂函数使用 JSDoc 注释
 * @param x - X 坐标
 * @param y - Y 坐标
 * @returns 转换后的画布坐标
 */
function toCanvasPoint(x: number, y: number): { x: number; y: number } {
  // 实现
}
```

## ESLint 和 Prettier 配置

### ESLint 规则

- 使用单引号（`singleQuote: true`）
- 不使用分号（`semi: false`）
- 箭头函数参数省略括号（`arrowParens: 'avoid'`）
- 行宽限制 100 字符（`printWidth: 100`）
- 未使用的变量警告（以 `_` 开头的参数除外）

### 自动格式化

保存文件时建议配置编辑器自动运行 Prettier 格式化。

## 常见任务

### 添加新组件

```bash
# 在相应目录创建 .vue 文件
src/components/workspace/NewComponent.vue
```

### 添加新类型

```typescript
// src/types/index.ts
export interface NewType {
  id: string
  name: string
}
```

### 添加新 Composable

```typescript
// src/composables/useNewFeature.ts
export function useNewFeature() {
  // 实现
  return {
    /* 导出的状态和方法 */
  }
}
```

### 修改画布配置

```typescript
// src/config/index.ts
export const CANVAS_CONFIG = {
  defaultWidth: 800,
  defaultHeight: 600,
  // ...
}
```

## 最佳实践

1. **类型安全：** 充分利用 TypeScript，避免使用 `any`
2. **组合式 API：** 使用 `<script setup>` 语法
3. **响应式：** 使用 `ref`、`reactive`、`computed` 管理状态
4. **可复用性：** 将可复用逻辑提取到 Composables
5. **性能：** 使用 `v-memo`、`v-once` 优化渲染
6. **可访问性：** 使用语义化 HTML 和 ARIA 属性
7. **中文 UI：** 所有面向用户的文本使用中文
8. **代码一致性：** 遵循 ESLint 和 Prettier 规则

## 开发注意事项

- **原型代码：** `prototype/` 目录包含原生 JS 原型，不要修改
- **主应用：** 所有新功能在 `src/` 目录开发
- **状态管理：** 复杂状态考虑使用 Pinia
- **画布渲染：** 使用 Konva.js 和 vue-konva 处理画布交互
- **样式系统：** 优先使用 Tailwind CSS 工具类
