# Tag 标签

用于标记和分类的标签。

## 基础用法

```vue
<script setup lang="ts">
import { NebulaTag } from '@nebula-studio/nebula-ui';
</script>

<template>
  <NebulaTag>标签</NebulaTag>
  <NebulaTag variant="primary">主要</NebulaTag>
  <NebulaTag variant="success">成功</NebulaTag>
  <NebulaTag variant="warning">警告</NebulaTag>
  <NebulaTag variant="danger">危险</NebulaTag>
</template>
```

## 可关闭

```vue
<template>
  <NebulaTag closable @close="handleClose">可关闭标签</NebulaTag>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| variant | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | 标签类型 |
| closable | `boolean` | `false` | 是否可关闭 |
| class | `string` | `''` | 自定义 CSS 类名 |

### Events

| 事件名 | 参数 | 说明       |
| ------ | ---- | ---------- |
| close  | —    | 关闭时触发 |

### Slots

| 插槽名  | 说明     |
| ------- | -------- |
| default | 标签内容 |
