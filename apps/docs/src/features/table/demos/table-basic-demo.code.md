```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  NebulaTable,
  NebulaTableColumn,
} from '@nebula-studio/nebula-ui';
import { createTableDemoRows } from './tableDemoData';

const allRows = ref(createTableDemoRows());
const rows = computed(() => allRows.value.slice(0, 5));
</script>

<template>
  <NebulaTable :data="rows" stripe>
    <NebulaTableColumn field="module" title="Module" min-width="180" />
    <NebulaTableColumn field="owner" title="Owner" width="120" />
    <NebulaTableColumn field="status" title="Status" width="120" />
    <NebulaTableColumn field="score" title="Score" width="100" />
  </NebulaTable>
</template>
```

数据源：`createTableDemoRows()` 生成 `DemoRow[]`，演示中取 `slice(0, 5)` 避免表格过长。
