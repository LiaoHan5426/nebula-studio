# Anchor 锚点

锚点导航组件，用于页面内锚点定位。

## 基础用法

```vue
<script setup lang="ts">
import { NebulaAnchor } from '@nebula-studio/nebula-ui';

const anchors = [
  { href: '#section-1', title: '章节一' },
  { href: '#section-2', title: '章节二' },
  { href: '#section-3', title: '章节三' },
];
</script>

<template>
  <NebulaAnchor :items="anchors" />
</template>
```

## API

### Props

| 属性   | 类型           | 默认值 | 说明             |
| ------ | -------------- | ------ | ---------------- |
| items  | `AnchorItem[]` | `[]`   | 锚点项列表       |
| offset | `number`       | `0`    | 锚点偏移量（px） |
| class  | `string`       | `''`   | 自定义 CSS 类名  |

### AnchorItem

| 属性     | 类型           | 说明     |
| -------- | -------------- | -------- |
| href     | `string`       | 锚点链接 |
| title    | `string`       | 显示文本 |
| children | `AnchorItem[]` | 子锚点   |

### Events

| 事件名 | 参数             | 说明           |
| ------ | ---------------- | -------------- |
| change | `(href: string)` | 锚点切换时触发 |
