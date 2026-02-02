# AGV 地图编辑器

AGV 地图编辑器是一个基于 Web 的可视化编辑器，用于创建和管理 AGV（自动导引车）地图，支持分层地图结构、拖放元素放置和工业风格的 UI 设计。

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **UI 组件**: Radix Vue
- **样式**: Tailwind CSS
- **画布渲染**: Konva.js + Vue-Konva
- **图标**: Lucide Vue Next
- **代码规范**: ESLint + Prettier

## 项目结构

```
agv-map-editor/
├── .git/                   # Git 版本控制
├── .opencode/              # OpenCode AI 配置
│   ├── skills/            # 自定义技能
│   ├── package.json       # OpenCode 依赖
│   └── bun.lock          # Bun 锁文件
├── node_modules/          # 项目依赖
├── prototype/             # 原型版本（原生 JS）
│   ├── index.html        # 原型主页面
│   ├── app.js            # 原型核心逻辑
│   ├── config.js         # 原型配置
│   ├── styles.css        # 原型主样式
│   └── tree.css          # 原型树形结构样式
├── src/                   # 源代码目录
│   ├── assets/           # 静态资源
│   ├── components/       # Vue 组件
│   ├── composables/      # 组合式函数
│   ├── constants/        # 常量定义
│   ├── lib/              # 工具库
│   ├── stores/           # Pinia 状态管理
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   ├── App.vue           # 根组件
│   ├── main.ts           # 应用入口
│   └── style.css         # 全局样式
├── .eslintignore          # ESLint 忽略配置
├── .eslintrc.cjs          # ESLint 配置
├── .gitignore             # Git 忽略配置
├── .prettierignore        # Prettier 忽略配置
├── .prettierrc            # Prettier 配置
├── AGENTS.md              # AI 代理开发指南
├── components.json        # 组件配置
├── index.html             # 应用入口 HTML
├── package.json           # 项目依赖配置
├── package-lock.json      # 依赖锁文件
├── postcss.config.js      # PostCSS 配置
├── README.md              # 项目说明文档
├── tailwind.config.js     # Tailwind CSS 配置
├── tsconfig.json          # TypeScript 配置
├── tsconfig.node.json     # Node TypeScript 配置
└── vite.config.ts         # Vite 构建配置
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

## 原型版本

项目包含一个原生 JavaScript 实现的原型版本，位于 `prototype/` 目录。可以直接在浏览器中打开 `prototype/index.html` 查看原型效果。

## 开发指南

详细的开发指南和编码规范请参考 [AGENTS.md](./AGENTS.md) 文件。

## 功能特性

- 可视化地图编辑
- 拖放式元素放置
- 分层地图结构
- 工业风格 UI 设计
- 实时属性编辑
- 画布缩放和平移
- 元素选择和移动

## 许可证

本项目为私有项目。
