# Table 表格

基于 vxe-table 封装的数据表格组件，支持排序、筛选、分页联动等功能。

## 基础用法

```vue
<script setup lang="ts">
import { NebulaTable } from '@nebula-studio/nebula-ui';

const tableData = [
  { id: 1, name: '张三', age: 28, email: 'zhang@example.com' },
  { id: 2, name: '李四', age: 32, email: 'li@example.com' },
  { id: 3, name: '王五', age: 25, email: 'wang@example.com' },
];
</script>

<template>
  <NebulaTable :data="tableData">
    <template #default>
      <vxe-column field="id" title="ID" width="80" />
      <vxe-column field="name" title="姓名" />
      <vxe-column field="age" title="年龄" sortable />
      <vxe-column field="email" title="邮箱" />
    </template>
  </NebulaTable>
</template>
```

## 带边框

```vue
<template>
  <NebulaTable :data="tableData" border>
    <template #default>
      <vxe-column field="name" title="姓名" />
      <vxe-column field="age" title="年龄" />
    </template>
  </NebulaTable>
</template>
```

## 拖拽模式

```vue
<template>
  <!-- 行拖拽 -->
  <NebulaTable :data="tableData" drag-mode="row">
    <template #default>
      <vxe-column field="name" title="姓名" />
    </template>
  </NebulaTable>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| data | `unknown[]` | `[]` | 表格数据 |
| border | `boolean \| 'full' \| 'inner' \| 'outer'` | `true` | 是否显示边框 |
| stripe | `boolean` | `false` | 是否显示斑马纹 |
| loading | `boolean` | `false` | 是否显示加载状态 |
| size | `'mini' \| 'small' \| 'medium'` | `'small'` | 表格尺寸 |
| height | `string \| number` | — | 表格高度 |
| maxHeight | `string \| number` | — | 表格最大高度 |
| rowConfig | `object` | — | 行配置 |
| rowKey | `string` | — | 行数据唯一键字段 |
| columnConfig | `object` | — | 列配置 |
| scrollX | `boolean \| object` | — | 横向虚拟滚动配置 |
| dragMode | `'none' \| 'row' \| 'column' \| 'both'` | `'none'` | 拖拽模式 |
| treeConfig | `object` | — | 树形数据配置 |
| class | `string` | `''` | 自定义 CSS 类名 |

### Slots

| 插槽名  | 说明                 |
| ------- | -------------------- |
| default | 列定义（vxe-column） |
| loading | 自定义加载内容       |
