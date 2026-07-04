# Input 输入框

基础表单输入组件。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { NebulaInput } from '@nebula-studio/nebula-ui';

const value = ref('');
</script>

<template>
  <NebulaInput v-model="value" placeholder="请输入内容" />
</template>
```

## 输入类型

```vue
<template>
  <NebulaInput type="text" placeholder="文本输入" />
  <NebulaInput type="password" placeholder="密码输入" />
  <NebulaInput type="email" placeholder="邮箱" />
  <NebulaInput type="number" placeholder="数字" />
</template>
```

## 禁用与只读

```vue
<template>
  <NebulaInput disabled placeholder="禁用状态" />
  <NebulaInput readonly model-value="只读内容" />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `string \| number` | `''` | 绑定值（v-model） |
| type | `'text' \| 'password' \| 'email' \| 'number' \| 'tel' \| 'url'` | `'text'` | 输入类型 |
| placeholder | `string` | `''` | 占位文本 |
| disabled | `boolean` | `false` | 是否禁用 |
| readonly | `boolean` | `false` | 是否只读 |
| tooltip | `string` | `''` | 提示文本 |
| tooltipPlacement | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | 提示位置 |
| class | `string` | `''` | 自定义 CSS 类名 |

### Events

| 事件名            | 参数              | 说明             |
| ----------------- | ----------------- | ---------------- |
| update:modelValue | `(value: string)` | 输入值变化时触发 |
| input             | `(event: Event)`  | 原生 input 事件  |
| change            | `(event: Event)`  | 原生 change 事件 |
