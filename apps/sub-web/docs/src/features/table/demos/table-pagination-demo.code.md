```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  NebulaPagination,
  NebulaTable,
  NebulaTableColumn,
} from '@nebula-studio/nebula-ui';
import { createTableDemoRows } from './tableDemoData';

const allRows = ref(createTableDemoRows());
const page = ref(1);
const pageSize = ref(5);

const rows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return allRows.value.slice(start, start + pageSize.value);
});
</script>

<template>
  <div>
    <NebulaTable :data="rows">
      <NebulaTableColumn field="module" title="Module" min-width="180" />
      <NebulaTableColumn field="owner" title="Owner" width="120" />
      <NebulaTableColumn field="status" title="Status" width="120" />
    </NebulaTable>
    <NebulaPagination
      v-model="page"
      v-model:page-size="pageSize"
      :total="allRows.length"
      :page-sizes="[5, 10, 20]"
    />
  </div>
</template>
```

分页状态：`page` / `pageSize` 与 `rows` 由同一数据源 `slice` 联动；`total` 为完整数据集长度。
