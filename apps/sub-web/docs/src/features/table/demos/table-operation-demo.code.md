```vue
<script setup lang="ts">
import {
  NebulaButton,
  NebulaTable,
  NebulaTableColumn,
} from '@nebula-studio/nebula-ui';
import { computed, ref } from 'vue';
import { createTableDemoRows, type DemoRow } from './tableDemoData';

const allRows = ref(createTableDemoRows());
const rows = computed(() => allRows.value.slice(0, 5));
const lastAction = ref('尚未执行操作');

function onInspect(row: DemoRow): void {
  lastAction.value = `Inspect ${row.module}`;
}

function onDisable(row: DemoRow): void {
  lastAction.value = `Disable ${row.module}`;
}
</script>

<template>
  <div>
    <NebulaTable :data="rows">
      <NebulaTableColumn field="module" title="Module" min-width="180" />
      <NebulaTableColumn field="status" title="Status" width="120" />
      <NebulaTableColumn title="Action" width="220">
        <template #default="{ row }">
          <NebulaButton variant="secondary" @click="onInspect(row)">
            Inspect
          </NebulaButton>
          <NebulaButton variant="ghost" @click="onDisable(row)">
            Disable
          </NebulaButton>
        </template>
      </NebulaTableColumn>
    </NebulaTable>
    <p>Last Action: {{ lastAction }}</p>
  </div>
</template>
```

操作列使用列默认插槽 `#default="{ row }"`；`row` 类型与 `DemoRow` 一致。
