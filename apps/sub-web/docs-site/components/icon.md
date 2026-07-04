# Icon 图标

基于 Iconify 的图标组件。

## 基础用法

```vue
<script setup lang="ts">
import { NebulaIcon } from '@nebula-studio/nebula-ui';
</script>

<template>
  <NebulaIcon icon="lucide:check" />
  <NebulaIcon icon="lucide:x" />
  <NebulaIcon icon="lucide:search" />
</template>
```

## 自定义尺寸

```vue
<template>
  <NebulaIcon icon="lucide:home" :size="16" />
  <NebulaIcon icon="lucide:home" :size="24" />
  <NebulaIcon icon="lucide:home" :size="32" />
</template>
```

## API

### Props

| 属性  | 类型     | 默认值 | 说明             |
| ----- | -------- | ------ | ---------------- |
| icon  | `string` | —      | Iconify 图标名称 |
| size  | `number` | `16`   | 图标尺寸（px）   |
| class | `string` | `''`   | 自定义 CSS 类名  |
