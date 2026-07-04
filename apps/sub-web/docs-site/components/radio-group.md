# Radio 单选框

基础单选框组件。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { NebulaRadioGroup, NebulaRadio } from '@nebula-studio/nebula-ui';

const value = ref('a');
</script>

<template>
  <NebulaRadioGroup v-model="value">
    <NebulaRadio value="a">选项 A</NebulaRadio>
    <NebulaRadio value="b">选项 B</NebulaRadio>
    <NebulaRadio value="c">选项 C</NebulaRadio>
  </NebulaRadioGroup>
</template>
```

## API

### RadioGroup Props

| 属性       | 类型      | 默认值  | 说明              |
| ---------- | --------- | ------- | ----------------- |
| modelValue | `string`  | `''`    | 绑定值（v-model） |
| disabled   | `boolean` | `false` | 是否禁用所有子项  |
| class      | `string`  | `''`    | 自定义 CSS 类名   |

### RadioGroup Events

| 事件名            | 参数              | 说明             |
| ----------------- | ----------------- | ---------------- |
| update:modelValue | `(value: string)` | 选中值变化时触发 |

### Radio Props

| 属性     | 类型      | 默认值  | 说明           |
| -------- | --------- | ------- | -------------- |
| value    | `string`  | —       | 单选值（必填） |
| disabled | `boolean` | `false` | 是否禁用       |
