# Button 按钮

常用的操作按钮。

## 基础用法

```vue
<script setup lang="ts">
import { NebulaButton } from '@nebula-studio/nebula-ui';
</script>

<template>
  <NebulaButton variant="primary">主要按钮</NebulaButton>
  <NebulaButton variant="secondary">次要按钮</NebulaButton>
  <NebulaButton variant="ghost">幽灵按钮</NebulaButton>
</template>
```

## 图标按钮

设置 `icon` 属性可切换为紧凑的图标按钮模式：

```vue
<template>
  <NebulaButton icon tooltip="编辑">
    <IconEdit />
  </NebulaButton>
</template>
```

## 禁用状态

```vue
<template>
  <NebulaButton variant="primary" disabled>禁用按钮</NebulaButton>
</template>
```

## 带 Tooltip

```vue
<template>
  <NebulaButton tooltip="保存更改" tooltip-placement="top"> 保存 </NebulaButton>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| variant | `'primary' \| 'secondary' \| 'ghost'` | `'secondary'` | 按钮类型 |
| icon | `boolean` | `false` | 是否为图标按钮模式 |
| active | `boolean` | `false` | 是否处于激活状态 |
| disabled | `boolean` | `false` | 是否禁用 |
| type | `string` | `'button'` | 原生 type 属性 |
| tooltip | `string` | `''` | 提示文本 |
| tooltipPlacement | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | 提示位置 |
| title | `string` | `''` | 原生 title 属性 |
| ariaLabel | `string` | `''` | 无障碍标签 |
| class | `string` | `''` | 自定义 CSS 类名 |

### Events

| 事件名 | 参数                  | 说明           |
| ------ | --------------------- | -------------- |
| click  | `(event: MouseEvent)` | 点击按钮时触发 |

### Slots

| 插槽名  | 说明     |
| ------- | -------- |
| default | 按钮内容 |
