# Pagination 分页

分页组件，支持页码切换和每页条数选择，可与 NebulaTable 联动。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { NebulaPagination } from '@nebula-studio/nebula-ui';

const currentPage = ref(1);
const pageSize = ref(10);
</script>

<template>
  <NebulaPagination
    v-model="currentPage"
    v-model:page-size="pageSize"
    :total="100"
  />
</template>
```

## 自定义每页条数选项

```vue
<template>
  <NebulaPagination
    v-model="currentPage"
    :total="200"
    :page-sizes="[5, 10, 25, 50]"
  />
</template>
```

## 隐藏每页条数切换

```vue
<template>
  <NebulaPagination
    v-model="currentPage"
    :total="50"
    :show-size-changer="false"
  />
</template>
```

## 自定义分页信息

通过默认插槽自定义分页信息展示：

```vue
<template>
  <NebulaPagination v-model="currentPage" :total="100">
    <template #default="{ page, pageCount, pageSize, total }">
      <span>第 {{ page }} 页 / 共 {{ pageCount }} 页（{{ total }} 条）</span>
    </template>
  </NebulaPagination>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `number` | `1` | 当前页码（v-model） |
| total | `number` | `0` | 数据总条数 |
| pageSize | `number` | `10` | 每页条数（v-model:page-size） |
| pageSizes | `number[]` | `[10, 20, 50, 100]` | 每页条数选项 |
| disabled | `boolean` | `false` | 是否禁用 |
| showSizeChanger | `boolean` | `true` | 是否显示每页条数切换 |
| class | `string` | `''` | 自定义 CSS 类名 |

### Events

| 事件名            | 参数                   | 说明                     |
| ----------------- | ---------------------- | ------------------------ |
| update:modelValue | `(page: number)`       | 页码变化时触发           |
| update:pageSize   | `(size: number)`       | 每页条数变化时触发       |
| change            | `({ page, pageSize })` | 页码或每页条数变化时触发 |

### Slots

| 插槽名 | 说明 |
| --- | --- |
| default | 自定义分页信息，作用域插槽提供 `{ page, pageCount, pageSize, total }` |
