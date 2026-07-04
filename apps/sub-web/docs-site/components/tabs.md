# Tabs 标签页

分隔内容上有关联但属于不同类别的数据集。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { NebulaTabs } from '@nebula-studio/nebula-ui';
import type { NebulaTabItem } from '@nebula-studio/nebula-ui';

const activeTab = ref('tab1');
const tabs: NebulaTabItem[] = [
  { value: 'tab1', label: '标签一' },
  { value: 'tab2', label: '标签二' },
  { value: 'tab3', label: '标签三', disabled: true },
];
</script>

<template>
  <NebulaTabs v-model="activeTab" :tabs="tabs" />
</template>
```

## API

### Props

| 属性       | 类型              | 默认值 | 说明                        |
| ---------- | ----------------- | ------ | --------------------------- |
| modelValue | `string`          | `''`   | 当前激活的标签值（v-model） |
| tabs       | `NebulaTabItem[]` | `[]`   | 标签页列表                  |
| class      | `string`          | `''`   | 自定义 CSS 类名             |
| listClass  | `string`          | `''`   | 标签列表自定义 CSS 类名     |

### NebulaTabItem

| 属性     | 类型      | 说明         |
| -------- | --------- | ------------ |
| value    | `string`  | 标签唯一标识 |
| label    | `string`  | 标签显示文本 |
| disabled | `boolean` | 是否禁用     |

### Events

| 事件名            | 参数              | 说明           |
| ----------------- | ----------------- | -------------- |
| update:modelValue | `(value: string)` | 切换标签时触发 |

### Slots

| 插槽名  | 说明           |
| ------- | -------------- |
| default | 标签页内容区域 |
