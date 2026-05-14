```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  NebulaPagination,
  NebulaTable,
  NebulaTableColumn,
} from '@nebula-studio/nebula-ui';
import { createTableDemoRows } from '../../table/demos/tableDemoData';

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

`createTableDemoRows` 定义在 Table 演示模块；分页状态与 `slice` 后的表格数据联动。
