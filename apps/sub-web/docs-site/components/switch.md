# Switch 开关

开关选择器。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { NebulaSwitch } from '@nebula-studio/nebula-ui';

const checked = ref(false);
</script>

<template>
  <NebulaSwitch v-model="checked" />
</template>
```

## API

### Props

| 属性       | 类型      | 默认值  | 说明                |
| ---------- | --------- | ------- | ------------------- |
| modelValue | `boolean` | `false` | 是否选中（v-model） |
| disabled   | `boolean` | `false` | 是否禁用            |
| class      | `string`  | `''`    | 自定义 CSS 类名     |

### Events

| 事件名            | 参数               | 说明               |
| ----------------- | ------------------ | ------------------ |
| update:modelValue | `(value: boolean)` | 选中状态变化时触发 |
