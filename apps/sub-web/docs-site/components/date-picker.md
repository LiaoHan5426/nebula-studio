# DatePicker 日期选择

日期选择组件。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { NebulaDatePicker } from '@nebula-studio/nebula-ui';

const date = ref('');
</script>

<template>
  <NebulaDatePicker v-model="date" placeholder="选择日期" />
</template>
```

## API

### Props

| 属性        | 类型      | 默认值  | 说明              |
| ----------- | --------- | ------- | ----------------- |
| modelValue  | `string`  | `''`    | 绑定值（v-model） |
| placeholder | `string`  | `''`    | 占位文本          |
| disabled    | `boolean` | `false` | 是否禁用          |
| class       | `string`  | `''`    | 自定义 CSS 类名   |

### Events

| 事件名            | 参数              | 说明           |
| ----------------- | ----------------- | -------------- |
| update:modelValue | `(value: string)` | 日期变化时触发 |
