<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  NebulaPagination,
  NebulaTable,
  NebulaTableColumn,
} from '@nebula-studio/nebula-ui';

const page = ref(1);
const pageSize = ref(5);
const rows = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  name: `成员 ${index + 1}`,
  role: index % 3 === 0 ? '管理员' : '普通用户',
}));
const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return rows.slice(start, start + pageSize.value);
});
</script>

<template>
  <div class="table-pagination-demo">
    <NebulaTable :data="pageRows" :border="true">
      <NebulaTableColumn field="id" title="ID" :width="80" />
      <NebulaTableColumn field="name" title="姓名" />
      <NebulaTableColumn field="role" title="角色" />
    </NebulaTable>
    <NebulaPagination
      v-model="page"
      v-model:page-size="pageSize"
      :total="rows.length"
      align="between"
      :layout="['total', 'pager', 'sizes']"
    />
  </div>
</template>

<style scoped>
.table-pagination-demo {
  display: grid;
  gap: 16px;
}
</style>
