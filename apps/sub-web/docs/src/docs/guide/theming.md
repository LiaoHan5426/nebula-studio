---
title: 主题定制
description: 自定义 Nebula Studio 主题样式
---

# 主题定制

Nebula Studio 采用基于 CSS 变量的主题系统，所有语义颜色均通过 `hsl(var(--xxx))` 形式引用，方便全局替换。

## CSS 变量列表

### 语义色

| 变量名                 | 说明     | 默认值（亮色） |
| ---------------------- | -------- | -------------- |
| `--primary`            | 主色     | `220 90% 56%`  |
| `--primary-foreground` | 主色前景 | `0 0% 100%`    |
| `--background`         | 背景色   | `0 0% 100%`    |
| `--foreground`         | 前景色   | `222 47% 11%`  |
| `--muted`              | 弱化色   | `210 40% 96%`  |
| `--muted-foreground`   | 弱化前景 | `215 16% 47%`  |
| `--card`               | 卡片背景 | `0 0% 100%`    |
| `--border`             | 边框色   | `214 32% 91%`  |

### 状态色

| 变量名          | 说明      |
| --------------- | --------- |
| `--success`     | 成功      |
| `--warning`     | 警告      |
| `--destructive` | 危险/错误 |
| `--info`        | 信息      |

## 自定义主题

在 CSS 中覆盖变量即可：

```css
/* 自定义蓝色主题 */
:root {
  --primary: 210 100% 50%;
  --primary-foreground: 0 0% 100%;
}

/* 暗色模式 */
html.dark {
  --background: 222 47% 6%;
  --foreground: 210 40% 98%;
  --card: 222 47% 9%;
  --border: 217 19% 18%;
}
```

## 组件级覆盖

如需针对单个组件调整样式，可使用 CSS 选择器覆盖：

```css
/* 增大按钮圆角 */
.nebula-button {
  border-radius: 8px;
}
```
