<script setup lang="ts">
import { computed, ref } from 'vue';
import { NebulaTable, NebulaTableColumn } from '@nebula-studio/nebula-ui';
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
import tableBasicDemoCode from './table-basic-demo.code.md?raw';
import { createTableDemoRows } from './tableDemoData';

const allRows = ref(createTableDemoRows());
const previewRows = computed(() => allRows.value.slice(0, 5));

const code = tableBasicDemoCode;
</script>

<template>
  <section id="table-basic">
    <DocsDemoSection
      title="NebulaTable 基础用法"
      description="用 NebulaTable + NebulaTableColumn 快速渲染列表数据。"
      :code="code"
    >
      <div class="table-demo-wrap">
        <NebulaTable :data="previewRows" stripe>
          <NebulaTableColumn field="module" title="Module" min-width="180" />
          <NebulaTableColumn field="owner" title="Owner" width="120" />
          <NebulaTableColumn field="status" title="Status" width="120" />
          <NebulaTableColumn field="score" title="Score" width="100" />
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
