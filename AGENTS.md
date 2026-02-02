# AGENTS.md - AGV 地图编辑器开发指南

本文档为在 AGV 地图编辑器项目中工作的 AI 代理提供编码指南和约定。

## 项目概述

AGV 地图编辑器是一个基于 Web 的可视化编辑器，用于创建和管理 AGV（自动导引车）地图，支持分层地图结构、拖放元素放置和工业风格的 UI 设计。

**技术栈：** 原生 JavaScript、HTML5、CSS3（无框架）
**语言：** 中文（zh-CN）用于 UI 文本和注释
**目标：** 支持 ES6+ 的现代浏览器

## 项目结构

```
agv-map-editor/
├── prototype/           # 当前工作原型
│   ├── index.html      # 主应用程序结构
│   ├── app.js          # 核心应用逻辑
│   ├── styles.css      # 主样式（工业主题）
│   └── tree.css        # 地图树/层级样式
└── AGENTS.md           # 本文件
```

## 构建/检查/测试命令

**注意：** 本项目目前没有构建系统、package.json 或测试框架。

### 开发
- 直接在浏览器中打开 `prototype/index.html`
- 使用浏览器开发者工具进行调试
- 推荐使用 Live Server 或类似工具实现热重载

### 测试
- 需要在浏览器中手动测试
- 在 Chrome/Edge 中测试（主要目标）
- 目前不存在自动化测试套件

### 未来考虑
添加构建工具时，考虑：
- Vite 或 Parcel 用于打包
- ESLint 用于代码检查
- Vitest 或 Jest 用于测试

## 代码风格指南

### 通用原则
- **简单优先：** 优先使用原生 JS 而非框架
- **工业美学：** 简洁、功能性、最小装饰
- **性能：** 优化画布交互的流畅性
- **可访问性：** 使用语义化 HTML 和 ARIA 标签

### JavaScript 风格

#### 命名约定
- **变量/函数：** `camelCase`（例如：`canvasStage`、`updateSelection`）
- **常量：** DOM 引用使用 `camelCase`，真正的常量使用 `UPPER_SNAKE_CASE`
- **CSS 类名：** `kebab-case`（例如：`map-item`、`canvas-stage`）
- **数据属性：** `kebab-case`（例如：`data-type`、`data-label`）

#### 变量声明
```javascript
// 默认使用 const
const canvasStage = document.getElementById("canvasStage");

// 仅在需要重新赋值时使用 let
let selectedNode = null;
let isDragging = false;

// 完全避免使用 var
```

#### 函数
```javascript
// 简单操作使用箭头函数
const updateEmptyHint = () => {
  emptyHint.style.display = canvasContent.children.length ? "none" : "block";
};

// 复杂逻辑使用命名函数
function createNode({ type, label, x, y }) {
  // 实现代码
}

// 对象参数使用解构
const toCanvasPoint = (clientX, clientY) => {
  const rect = canvasViewport.getBoundingClientRect();
  return { x, y };
};
```

#### 事件处理器
```javascript
// 直接将监听器附加到元素上
node.addEventListener("mousedown", (event) => {
  if (event.button !== 0) return; // 守卫子句优先
  updateSelection(node);
  isDragging = true;
});

// 适当时对动态元素使用事件委托
```

#### DOM 操作
```javascript
// 在模块级别缓存 DOM 引用
const canvasContent = document.getElementById("canvasContent");

// 使用模板字面量生成 HTML
node.innerHTML = `
  <div class="node-icon">${label.slice(0, 1)}</div>
  <div class="node-label">${label}</div>
`;

// 优先使用 classList 而非 className 操作
node.classList.add("selected");
node.classList.remove("selected");
```

### CSS 风格

#### 组织结构
1. CSS 变量（`:root`）
2. 重置/基础样式
3. 布局（grid、flex）
4. 组件（面板、按钮等）
5. 状态修饰符（`:hover`、`.active`、`.selected`）

#### 命名
```css
/* 基于组件的命名 */
.map-item { }
.map-item.active { }
.map-item.sub { }

/* 需要时使用类 BEM 结构 */
.panel-header { }
.panel-title { }
.panel-subtitle { }
```

#### 变量
```css
:root {
  --bg: #e0e0e0;
  --panel: #eeeeee;
  --border: #bcbcbc;
  --primary: #0066cc;
  --text: #333333;
  --radius: 2px; /* 工业风格的最小圆角 */
}
```

#### 值
- 精确布局和边框使用 `px`
- 响应式网格使用 `%` 或 `fr`
- 谨慎使用 `rem`/`em`（项目使用基于 px 的尺寸）
- 优先使用简写属性：`padding: 4px 8px;`

### HTML 风格

#### 结构
```html
<!-- 语义化 HTML5 元素 -->
<aside class="sidebar">
  <section class="panel">
    <header class="panel-header">
      <!-- 头部内容 -->
    </header>
    <!-- 面板内容 -->
  </section>
</aside>
```

#### 属性
- 使用 `data-*` 属性存储应用状态
- 为图标按钮添加 `title` 属性
- 为拖拽源显式设置 `draggable="true"`

### 注释

#### JavaScript 注释
```javascript
// 简短说明使用单行注释
// UI 相关注释使用中文：更新选中状态

// 复杂逻辑使用多行注释
/**
 * 将客户端坐标转换为画布坐标
 * 考虑缩放和滚动偏移
 */
```

#### CSS 注释
```css
/* 章节标题使用中文 */
/* 地图列表树形结构优化 */

/* 组件描述 */
/* 子地图连接横线 */
```

### 错误处理

```javascript
// 使用守卫子句提前返回
if (!data) return;
if (event.button !== 0) return;

// 验证数字输入
const nextX = Number(propX.value);
if (!Number.isNaN(nextX)) {
  selectedNode.style.left = `${nextX}px`;
}

// 使用 Math.max/min 进行边界检查
selectedNode.style.left = `${Math.max(0, newX)}px`;
```

### 状态管理

```javascript
// 模块级状态变量
let currentScale = 1;
let selectedNode = null;
let isDragging = false;

// 在专用函数中更新 UI
const updateSelection = (node) => {
  // 清除之前的状态
  if (selectedNode) {
    selectedNode.classList.remove("selected");
  }
  // 设置新状态
  selectedNode = node;
  // 更新 UI
  if (selectedNode) {
    selectedNode.classList.add("selected");
  }
};
```

## 设计模式

### 工业 UI 主题
- 最小圆角（`--radius: 2px`）
- 强边框和清晰分隔
- 柔和色调配高对比度
- CAD 风格画布，带网格和标尺
- 标题使用大写字母（`text-transform: uppercase`）

### 画布交互
- 从元素面板拖放到画布
- 点击选择，拖动移动
- 属性面板实时更新
- 使用范围滑块缩放（50%-200%）

### 地图层级
- 主地图带可折叠子地图
- 使用 CSS 边框的树形连接器
- 主地图/子地图的视觉区分

## 常见任务

### 添加新元素类型
1. 在 `index.html` 元素网格中添加元素卡片
2. 设置 `data-type` 和 `data-label` 属性
3. 如需要，在 `styles.css` 中添加特定类型样式
4. 图标将从标签的第一个字符自动生成

### 修改画布行为
- 在 `app.js` 中编辑事件处理器
- 更新 `toCanvasPoint()` 进行坐标转换
- 修改 `createNode()` 进行元素创建逻辑

### 样式更改
- 全局主题：编辑 `styles.css` 中的 CSS 变量
- 地图树：编辑 `tree.css`
- 特定组件：在 `styles.css` 中查找相关类

## 最佳实践

1. **保持简单：** 避免过度设计，这是一个原型
2. **测试交互：** 拖放、选择、缩放应该流畅
3. **保持一致性：** 遵循代码库中的现有模式
4. **中文 UI：** 所有面向用户的文本应使用中文
5. **工业美学：** 保持 CAD/工程工具的外观
6. **性能：** 最小化重排，缓存 DOM 查询
7. **可访问性：** 使用语义化 HTML 和适当的 ARIA 标签

## 未来增强

扩展此项目时，考虑：
- 添加撤销/重做功能
- 实现地图数据的保存/加载
- 添加路径绘制工具
- 支持地图导出格式
- 添加键盘快捷键
- 实现缩放至适应/实际大小
- 添加吸附网格功能
- 支持多选和组操作
