<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  NebulaPagination,
  NebulaTable,
  NebulaTableColumn,
} from '@nebula-studio/nebula-ui';
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
import paginationTableLinkageDemoCode from './pagination-table-linkage-demo.code.md?raw';
import { createTableDemoRows } from '../../table/demos/tableDemoData';

const allRows = ref(createTableDemoRows());
const paginationPage = ref(1);
const paginationPageSize = ref(5);

const paginationRows = computed(() => {
  const start = (paginationPage.value - 1) * paginationPageSize.value;
  return allRows.value.slice(start, start + paginationPageSize.value);
});

const code = paginationTableLinkageDemoCode;
</script>

<template>
  <section id="pagination-table-linkage">
    <DocsDemoSection
      title="与 NebulaTable 联动"
      description="表格展示当前页 slice 后的数据，分页 total 为完整数据条数。"
      :code="code"
    >
      <div class="table-demo-wrap">
        <NebulaTable :data="paginationRows">
          <NebulaTableColumn field="module" title="Module" min-width="180" />
          <NebulaTableColumn field="owner" title="Owner" width="120" />
          <NebulaTableColumn field="status" title="Status" width="120" />
        </NebulaTable>
      </div>
      <NebulaPagination
        v-model="paginationPage"
        v-model:page-size="paginationPageSize"
        :total="allRows.length"
        :page-sizes="[5, 10, 20]"
        class="pagination-table-linkage__pager"
      />
    </DocsDemoSection>
  </section>
</template>

<style lang="scss" scoped>
.pagination-table-linkage__pager {
  margin-top: 0.75rem;
}

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
