<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  NebulaTable,
  NebulaTableColumn,
  NebulaTableRow,
} from '@nebula-studio/nebula-ui';
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
import tableGroupedDemoCode from './table-grouped-demo.code.md?raw';
import { createTableDemoRows } from './tableDemoData';

const allRows = ref(createTableDemoRows());
const previewRows = computed(() => allRows.value.slice(0, 5));

const code = tableGroupedDemoCode;
</script>

<template>
  <section id="table-grouped">
    <DocsDemoSection
      title="NebulaTable 分组列与 dragMode"
      description="NebulaTableRow 用于声明式分组列；dragMode 作为后续行/列拖拽扩展入口。"
      :code="code"
    >
      <div class="table-demo-wrap">
        <NebulaTable :data="previewRows" border="full" :drag-mode="'row'">
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
      </div>
    </DocsDemoSection>
  </section>
</template>

<style scoped>
.table-demo-wrap {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.table-demo-wrap :deep(.nebula-table),
.table-demo-wrap :deep(.vxe-table) {
  width: 100%;
  min-width: 640px;
}
</style>
