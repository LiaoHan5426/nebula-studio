<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  NebulaPagination,
  NebulaTable,
  NebulaTableColumn,
} from '@nebula-studio/nebula-ui';
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
import tablePaginationDemoCode from './table-pagination-demo.code.md?raw';
import { createTableDemoRows } from './tableDemoData';

const allRows = ref(createTableDemoRows());
const paginationPage = ref(1);
const paginationPageSize = ref(5);

const paginationRows = computed(() => {
  const start = (paginationPage.value - 1) * paginationPageSize.value;
  return allRows.value.slice(start, start + paginationPageSize.value);
});

const code = tablePaginationDemoCode;
</script>

<template>
  <section id="table-pagination">
    <DocsDemoSection
      title="NebulaPagination 联动示例"
      description="NebulaPagination 与表格一起使用：上方数据、下方分页，一组状态联动。分页组件完整 API 与独立配置示例见左侧 Pagination。"
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
        class="table-pagination"
      />
    </DocsDemoSection>
  </section>
</template>

<style scoped>
.table-pagination {
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
