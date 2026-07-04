# Drawer 抽屉

屏幕边缘滑出的浮层面板。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { NebulaDrawer } from '@nebula-studio/nebula-ui';

const drawerOpen = ref(false);
</script>

<template>
  <NebulaButton variant="primary" @click="drawerOpen = true">
    打开抽屉
  </NebulaButton>

  <NebulaDrawer v-model:open="drawerOpen" title="抽屉标题">
    <p>抽屉内容区域</p>
  </NebulaDrawer>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| open | `boolean` | `false` | 是否显示（v-model:open） |
| title | `string` | `''` | 抽屉标题 |
| side | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | 抽屉弹出方向 |
| class | `string` | `''` | 自定义 CSS 类名 |

### Events

| 事件名      | 参数               | 说明               |
| ----------- | ------------------ | ------------------ |
| update:open | `(value: boolean)` | 显示状态变化时触发 |

### Slots

| 插槽名  | 说明     |
| ------- | -------- |
| default | 抽屉内容 |
