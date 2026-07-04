# 主题定制

Nebula Studio 使用基于 CSS 变量的主题系统，支持亮色和暗色两种模式。

## 亮色 / 暗色模式

在根元素添加 `dark` 类即可切换暗色模式：

```typescript
// 切换暗色模式
document.documentElement.classList.add('dark');

// 切换亮色模式
document.documentElement.classList.remove('dark');
```

## CSS 变量

所有主题色均通过 CSS 变量定义，可在项目中自由覆盖：

```css
:root {
  /* 背景色 */
  --background: 0 0% 100%;
  --foreground: 233 30% 20%;

  /* 卡片 */
  --card: 0 0% 100%;
  --card-foreground: 233 30% 20%;

  /* 主要色 */
  --primary: 221 83% 53%;
  --primary-foreground: 210 40% 98%;

  /* 次要色 */
  --secondary: 233 28% 93%;
  --secondary-foreground: 233 30% 20%;

  /* 边框 */
  --border: 220 13% 91%;

  /* 强调色 */
  --accent: 220 14% 96%;
  --accent-foreground: 233 30% 20%;
}

/* 暗色模式 */
.dark {
  --background: 233 30% 8%;
  --foreground: 220 30% 92%;

  --card: 233 30% 10%;
  --card-foreground: 220 30% 92%;

  --primary: 217 91% 60%;
  --primary-foreground: 220 30% 8%;

  --secondary: 233 20% 18%;
  --secondary-foreground: 220 30% 95%;

  --border: 233 15% 20%;

  --accent: 233 15% 16%;
  --accent-foreground: 220 30% 92%;
}
```

## 自定义主题

通过覆盖 CSS 变量实现自定义主题：

```css
/* 自定义品牌色 */
:root {
  --primary: 160 84% 39%;
  --primary-foreground: 0 0% 100%;
}
```

## Tailwind CSS 集成

组件库使用 Tailwind CSS v4 作为样式基础。主题变量通过 `@theme` 指令注册到 Tailwind：

```css
@theme inline {
  --color-primary: hsl(var(--primary));
  --color-secondary: hsl(var(--secondary));
  --color-background: hsl(var(--background));
  /* ... */
}
```

在组件中可直接使用 Tailwind 工具类：

```vue
<template>
  <div class="bg-primary text-primary-foreground rounded-lg p-4">
    自定义内容
  </div>
</template>
```
