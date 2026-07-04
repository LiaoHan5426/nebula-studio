# Progress 进度条

用于展示操作进度。

## 基础用法

```vue
<script setup lang="ts">
import { NebulaProgress } from '@nebula-studio/nebula-ui';
</script>

<template>
  <NebulaProgress :value="30" />
  <NebulaProgress :value="70" />
  <NebulaProgress :value="100" />
</template>
```

## API

### Props

| 属性  | 类型     | 默认值 | 说明            |
| ----- | -------- | ------ | --------------- |
| value | `number` | `0`    | 进度值（0-100） |
| class | `string` | `''`   | 自定义 CSS 类名 |
