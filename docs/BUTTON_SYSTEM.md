# AGV 地图编辑器 - 按钮设计系统

## 按钮组件库

### 1. Button（标准按钮）

**用途：** 主要操作按钮，带文字和可选图标

**变体（Variants）：**

- `primary` - 主要操作（发布、保存、确认）
- `secondary` - 次要操作（预览、取消）
- `ghost` - 轻量操作（新增、编辑）
- `danger` - 危险操作（删除、清空）
- `outline` - 强调边框（导入、导出）
- `link` - 链接样式（查看详情）

**尺寸（Sizes）：**

- `xs` - 24px 高度，11px 文字
- `sm` - 28px 高度，12px 文字
- `md` - 32px 高度，14px 文字（默认）
- `lg` - 40px 高度，16px 文字

**状态（States）：**

- `disabled` - 禁用状态（50% 透明度）
- `loading` - 加载状态（显示旋转图标）
- `block` - 全宽按钮

---

### 2. IconButton（图标按钮）

**用途：** 纯图标按钮，用于工具栏和紧凑空间

**变体：** `primary` | `secondary` | `ghost` | `danger`

**尺寸：**

- `xs` - 24×24px
- `sm` - 28×28px
- `md` - 32×32px（默认）
- `lg` - 40×40px

---

### 3. ToolButton（工具按钮）

**用途：** 画布工具栏专用按钮

**状态：**

- `active` - 激活状态（深灰背景 #525252）
- `inactive` - 未激活（透明背景）

**特点：**

- 固定尺寸：32px 高度
- 支持图标 + 文字组合
- 悬停反馈

---

### 4. ButtonGroup（按钮组）

**用途：** 组合多个按钮

**模式：**

- `horizontal` - 水平排列（默认）
- `vertical` - 垂直排列
- `attached` - 连接模式（共享边框）

---

## 设计规范

### 颜色系统

| 颜色       | 值        | 用途           |
| ---------- | --------- | -------------- |
| **主题蓝** | `#0066cc` | 主要操作、链接 |
| **深蓝**   | `#0052a3` | 主按钮悬停     |
| **危险红** | `#cc3300` | 删除、警告操作 |
| **深灰**   | `#525252` | 工具激活状态   |
| **浅灰**   | `#f5f5f5` | 次要按钮背景   |
| **边框灰** | `#d0d0d0` | 默认边框       |

### 工业风格特点

1. **极小圆角：** 2px（`rounded-[2px]`）
2. **大写文字：** `uppercase` + `font-semibold`
3. **清晰边框：** 1px 实线边框
4. **微妙动画：** 200ms 过渡 + 按下缩放 0.98
5. **高对比度：** 确保文字可读性

### 交互反馈

- **悬停：** 背景色加深 + 边框变化
- **按下：** `scale(0.98)` 缩放效果
- **焦点：** 2px 环形高亮（`focus:ring-2`）
- **禁用：** 50% 透明度 + 禁用光标

---

## 使用示例

### 基础按钮

```vue
<Button variant="primary" size="md">发布</Button>
<Button variant="secondary">预览</Button>
<Button variant="ghost">新增</Button>
<Button variant="danger">删除</Button>
```

### 带图标按钮

```vue
<Button variant="primary">
  <template #icon>
    <svg>...</svg>
  </template>
  保存
</Button>
```

### 加载状态

```vue
<Button variant="primary" :loading="true">保存中...</Button>
```

### 图标按钮

```vue
<IconButton variant="secondary" title="更多">
  <svg>...</svg>
</IconButton>
```

### 工具按钮

```vue
<ToolButton :active="tool === 'select'" title="选择工具 (V)">
  选择
</ToolButton>
```

### 按钮组

```vue
<ButtonGroup>
  <Button>撤销</Button>
  <Button>重做</Button>
</ButtonGroup>

<ButtonGroup attached>
  <Button>左对齐</Button>
  <Button>居中</Button>
  <Button>右对齐</Button>
</ButtonGroup>
```

---

## 可访问性

- ✅ 所有按钮支持键盘导航
- ✅ 焦点状态清晰可见
- ✅ 禁用状态正确标记
- ✅ 图标按钮必须提供 `title` 属性
- ✅ 加载状态保持按钮尺寸稳定

---

## 最佳实践

### ✅ 推荐

- 主要操作使用 `primary` 变体
- 危险操作使用 `danger` 变体并二次确认
- 工具栏使用 `ToolButton` 组件
- 图标按钮提供清晰的 `title` 提示
- 相关按钮使用 `ButtonGroup` 组织

### ❌ 避免

- 不要在一个视图中使用超过 1 个 `primary` 按钮
- 不要使用 emoji 作为图标
- 不要混用不同的按钮尺寸（除非有明确层级）
- 不要在悬停时使用 `scale` 变换（会导致布局抖动）
- 不要使用过长的按钮文字（超过 4 个汉字考虑缩写）
