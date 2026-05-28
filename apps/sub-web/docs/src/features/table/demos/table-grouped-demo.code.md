```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  NebulaTable,
  NebulaTableColumn,
  NebulaTableRow,
} from '@nebula-studio/nebula-ui';
import { createTableDemoRows } from './tableDemoData';

const allRows = ref(createTableDemoRows());
const rows = computed(() => allRows.value.slice(0, 5));
</script>

<template>
  <NebulaTable :data="rows" border="full" :drag-mode="'row'">
    <NebulaTableRow title="Base">
      <NebulaTableColumn field="module" title="Module" min-width="180" />
      <NebulaTableColumn field="owner" title="Owner" width="120" />
    </NebulaTableRow>
    <NebulaTableRow title="Metrics">
      <NebulaTableColumn field="status" title="Status" width="120" />
      <NebulaTableColumn field="score" title="Score" width="100" />
      <NebulaTableColumn field="updatedAt" title="Updated" width="130" />
    </NebulaTableRow>
  </NebulaTable>
</template>
```

`NebulaTableRow` 声明分组列标题；`drag-mode` 预留与后续拖拽能力对齐。
