# TreeMenu 树形菜单

树形菜单组件，用于展示层级结构数据。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { NebulaTreeMenu } from '@nebula-studio/nebula-ui';

const selectedKey = ref('');
const treeData = [
  {
    key: '1',
    label: '节点一',
    children: [
      { key: '1-1', label: '子节点 1-1' },
      { key: '1-2', label: '子节点 1-2' },
    ],
  },
  {
    key: '2',
    label: '节点二',
    children: [{ key: '2-1', label: '子节点 2-1' }],
  },
];
</script>

<template>
  <NebulaTreeMenu v-model="selectedKey" :items="treeData" />
</template>
```

## API

### Props

| 属性       | 类型             | 默认值 | 说明                        |
| ---------- | ---------------- | ------ | --------------------------- |
| modelValue | `string`         | `''`   | 当前选中项的 key（v-model） |
| items      | `TreeMenuItem[]` | `[]`   | 树形数据                    |
| class      | `string`         | `''`   | 自定义 CSS 类名             |

### TreeMenuItem

| 属性     | 类型             | 说明         |
| -------- | ---------------- | ------------ |
| key      | `string`         | 节点唯一标识 |
| label    | `string`         | 节点显示文本 |
| children | `TreeMenuItem[]` | 子节点列表   |
| disabled | `boolean`        | 是否禁用     |
| icon     | `string`         | 节点图标     |

### Events

| 事件名            | 参数            | 说明               |
| ----------------- | --------------- | ------------------ |
| update:modelValue | `(key: string)` | 选中节点变化时触发 |
