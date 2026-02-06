# 路径线功能实施进度总结

## 项目背景
AGV 地图编辑器 - 正在实施路径线功能，允许用户在节点之间创建和管理路径线。

**技术栈**: Vue 3 + TypeScript + Konva.js + Pinia + Tailwind CSS

## 工作环境
- **主分支**: `canvas`
- **工作分支**: `feature/path-line` (在 `.worktrees/path-line-feature` 目录)
- **使用 git worktree** 进行隔离开发
- **开发服务器**: http://localhost:3003

## 已完成的工作

### Phase 0: UI 组件集成 ✅
**提交**: `23151f1` - feat(ui): 添加基础 UI 组件

**创建的文件**:
- `src/components/ui/Dialog.vue` - 对话框组件
- `src/components/ui/DialogHeader.vue`
- `src/components/ui/DialogTitle.vue`
- `src/components/ui/DialogFooter.vue`
- `src/components/ui/Select.vue` - 下拉选择器
- `src/components/ui/SelectItem.vue`
- `src/components/ui/Input.vue` - 输入框
- `src/components/ui/Label.vue` - 标签

**说明**: 使用 radix-vue 创建了基础 UI 组件，用于后续表单对话框。

---

### Phase 1: 类型定义和基础工具 ✅
**提交**: `41ab3fc` - feat(types): 重构路径线类型定义，添加图形配置和转换工具

**修改的文件**:
- `src/types/index.ts` - 重构了路径线类型
  - `PathData`: 业务数据（用于导入导出）
  - `PathGraphicProps`: 图形属性（不导出）
  - `CanvasPathLine`: 运行时数据 = 业务 + 图形 + id

**新增文件**:
- `src/config/pathGraphics.ts` - 图形样式配置
  - 根据 `lineType` (0=直线, 1=弧线) 配置样式
  - 根据 `laneDir` (0=单向, 1=双向) 配置颜色和箭头
  - 样式规则: 单向=绿色+箭头, 双向=蓝色无箭头

- `src/utils/pathTransform.ts` - 数据转换工具
  - `calculateDistance()`: 欧几里得距离计算
  - `createPath()`: 创建新路径（自动计算距离）
  - `importPaths()` / `exportPaths()`: 导入导出转换

---

### Phase 2: Store 状态管理扩展 ✅
**提交**: `b707d14` - feat(store): 扩展状态管理，支持路径线管理和自动距离更新

**修改的文件**:
- `src/stores/canvasStore.ts` - 大幅扩展

**关键变更**:
1. **选中状态管理重构**:
   ```typescript
   selectedType: 'node' | 'path' | null
   selectedNodeIds: string[]  // 节点多选
   selectedPathId: string | null  // 路径单选
   ```
   - 互斥选中机制（选中节点清除路径，反之亦然）
   - 新增 `getSelectedObject` computed 属性

2. **路径线管理方法**:
   - `pathLines: CanvasPathLine[]` - 路径线列表
   - `addPathLine()` - 添加路径线
   - `addPathFromData()` - 从表单数据创建路径线
   - `updatePathLine()` - 更新路径线
   - `deletePathLine()` - 删除路径线
   - `updatePathDistances()` - 更新相关路径距离

3. **自动距离更新**:
   - `updateNode()` 中检测位置变化
   - 自动调用 `updatePathDistances()` 重新计算距离

---

### Phase 3: 路径线渲染组件 ✅
**提交**: `db5c16f` - feat(canvas): 添加路径线渲染组件，支持直线、贝塞尔曲线和箭头

**新增文件**:
- `src/components/canvas/PathLineElement.vue` - 路径线渲染组件
  - 直线渲染: `v-line` with `points: [x1, y1, x2, y2]`
  - 弧线渲染: `bezier: true` with 控制点 `cpx, cpy`
  - 箭头显示: `v-arrow` 在路径中点，根据 `showArrow` 控制
  - 选中高亮: 蓝色虚线边框
  - 悬停效果: 颜色变深 + 线宽 +1

**修改的文件**:
- `src/components/workspace/CanvasArea.vue`
  - 导入 `PathLineElement`
  - 在路径层渲染: `v-for="path in canvasStore.pathLines"`

---

### Phase 4: 创建表单和交互 ✅
**提交**: 
- `0849b71` - feat(dialogs): 添加路径表单对话框和工具栏集成
- `bf55388` - feat(canvas): 添加节点右键菜单功能

#### Task 4.1: 节点选择器组件 ✅
**文件**: `src/components/ui/NodeSelect.vue`
- 下拉选择器，显示所有节点
- 格式: "节点 {编号} ({x}, {y})"
- 支持 v-model 双向绑定

#### Task 4.2: 路径表单对话框 ✅
**文件**: `src/components/dialogs/PathFormDialog.vue`
- 完整的表单对话框，支持创建和编辑路径
- **表单字段**:
  - 起始节点 (NodeSelect, 必填)
  - 结束节点 (NodeSelect, 必填)
  - 路径类型 (Select: 0=直线, 1=弧线, 默认0)
  - 控制点 X/Y (Input, 仅弧线时显示, 条件必填)
  - 车道方向 (Select: 0=单向, 1=双向, 默认1)
  - 速度 (Input Number, 默认0)
  - 航向角字段 (可折叠, 默认0)
    - 正向航向角
    - 反向航向角
    - 车体正向航向角
    - 车体反向航向角
- **表单验证**:
  - 起始/结束节点不能相同
  - 节点必须存在
  - 弧线时控制点必填
- **提交逻辑**:
  - 调用 `canvasStore.addPathFromData()`
  - 自动计算距离
  - 关闭对话框

**相关更新**:
- `src/components/ui/Label.vue` - 添加 `required` 和 `htmlFor` 属性支持
- `src/components/ui/Select.vue` - 修复 v-model 绑定问题

#### Task 4.3: 工具栏创建按钮 ✅
**文件**: `src/components/workspace/CanvasToolbar.vue`
- 添加"创建路径"按钮（带加号图标）
- 绑定 PathFormDialog 打开事件
- 按钮位置：撤销/重做按钮后，保存按钮前

#### Task 4.4: 节点右键菜单 ✅
**新增文件**:
- `src/components/ui/ContextMenu.vue` - 通用右键菜单组件
  - 使用 Teleport 渲染到 body
  - 支持点击外部关闭
  - 支持 ESC 键关闭
  - 自动定位到鼠标位置

- `src/components/ui/ContextMenuItem.vue` - 菜单项组件
  - 支持图标
  - 支持 danger 变体（红色文字）
  - 悬停高亮效果

**修改的文件**:
- `src/components/canvas/NodeElement.vue`
  - 添加 `@contextmenu` 事件处理
  - 右键菜单选项:
    - **编辑节点** - TODO: 打开节点编辑对话框
    - **创建路径** - 打开 PathFormDialog，自动填充起始节点
    - **删除节点** - 确认后删除节点
  - 右键时自动选中节点（如果未选中）

---

## 下一步计划

### Phase 5: 属性面板编辑 🔄
**目标**: 在属性面板中显示和编辑路径属性

#### Task 5.1: 创建内联编辑组件
**文件**: `src/components/properties/EditableField.vue`
- 支持文本、数字、下拉选择
- 点击编辑，失焦保存
- 只读字段（如距离）

#### Task 5.2: 更新属性面板
**文件**: `src/components/properties/PropertiesPanel.vue`
- 检测选中类型（节点 vs 路径）
- 路径属性显示:
  - 起始节点（只读）
  - 结束节点（只读）
  - 路径类型（可编辑）
  - 距离（只读，自动计算）
  - 车道方向（可编辑）
  - 速度（可编辑）
  - 航向角（可编辑）
  - 控制点（仅弧线，可编辑）

#### Task 5.3: 路径选中交互
**文件**: `src/components/canvas/PathLineElement.vue`
- 添加点击事件处理
- 调用 `canvasStore.selectPath()`
- 选中时高亮显示

---

### Phase 6: 集成和测试 📋
**目标**: 完整功能集成和测试

#### Task 6.1: 导入导出集成
- 在导入时使用 `importPaths()`
- 在导出时使用 `exportPaths()`
- 测试导入导出数据完整性

#### Task 6.2: 功能测试
- 创建直线路径
- 创建弧线路径
- 编辑路径属性
- 删除路径
- 节点移动时距离自动更新
- 右键菜单创建路径

#### Task 6.3: 边界测试
- 无节点时创建路径
- 删除节点时关联路径处理
- 重复路径检测
- 表单验证边界情况

#### Task 6.4: 性能优化
- 大量路径时的渲染性能
- 视口剔除优化
- 选中状态更新优化

---

## 关键设计决策

1. **双标识系统**:
   - `id` (string): 前端唯一标识 (UUID)
   - `node` (number): 业务编号（可修改）

2. **距离自动计算**:
   - 使用欧几里得距离公式
   - 节点移动时自动更新
   - 用户不可手动修改（只读）

3. **图形属性不导出**:
   - 导出只包含业务数据 (`PathData`)
   - 导入时使用默认值补充图形属性

4. **选中机制**:
   - 节点支持多选
   - 路径单选
   - 互斥选中

5. **右键菜单设计**:
   - 使用 Teleport 避免 z-index 问题
   - 点击外部和 ESC 键关闭
   - 自动选中右键的节点

---

## 技术注意事项

1. **笛卡尔坐标系**: Stage 使用 `scaleY: -1` 实现 Y 轴翻转
2. **贝塞尔曲线**: Konva 的 `bezier: true` + 控制点
3. **箭头计算**: 路径中点 + 切线角度
4. **视口剔除**: 只渲染可见区域的元素（性能优化）
5. **v-model 绑定**: 使用 `:model-value` 和 `@update:model-value` 避免直接绑定 prop

---

## 当前问题

- LSP 警告: `importPaths` 和 `exportPaths` 未使用（将在 Phase 6 使用）
- 节点编辑对话框尚未实现（Task 4.4 中标记为 TODO）

---

## 继续工作的命令

```bash
cd .worktrees/path-line-feature
git status  # 查看当前状态
npm run dev  # 启动开发服务器 (http://localhost:3003)
git log --oneline -5  # 查看最近提交
```

---

## 提交历史

```
bf55388 feat(canvas): 添加节点右键菜单功能
0849b71 feat(dialogs): 添加路径表单对话框和工具栏集成
db5c16f feat(canvas): 添加路径线渲染组件，支持直线、贝塞尔曲线和箭头
b707d14 feat(store): 扩展状态管理，支持路径线管理和自动距离更新
41ab3fc feat(types): 重构路径线类型定义，添加图形配置和转换工具
23151f1 feat(ui): 添加基础 UI 组件 (Dialog, Select, Input, Label)
```

---

## 完成度

- ✅ Phase 0: UI 组件集成 (100%)
- ✅ Phase 1: 类型定义和基础工具 (100%)
- ✅ Phase 2: Store 状态管理扩展 (100%)
- ✅ Phase 3: 路径线渲染组件 (100%)
- ✅ Phase 4: 创建表单和交互 (100%)
- 🔄 Phase 5: 属性面板编辑 (0%)
- 📋 Phase 6: 集成和测试 (0%)

**总体进度**: 约 70% 完成
