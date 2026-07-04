# Checkbox 复选框

基础复选框组件。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { NebulaCheckbox } from '@nebula-studio/nebula-ui';

const checked = ref(false);
</script>

<template>
  <NebulaCheckbox v-model="checked">选项</NebulaCheckbox>
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
