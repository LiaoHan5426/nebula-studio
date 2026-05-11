<script setup lang="ts">
import { NebulaAnchor } from '@nebula-studio/nebula-ui';
import TableApiSection from './demos/TableApiSection.vue';
import TableBasicDemo from './demos/TableBasicDemo.vue';
import TableGroupedDemo from './demos/TableGroupedDemo.vue';
import TableOperationDemo from './demos/TableOperationDemo.vue';
import TablePaginationDemo from './demos/TablePaginationDemo.vue';
import { tableDocAnchorItems } from './demos/tableDocAnchors';
</script>

<template>
  <div class="table-layout">
    <NebulaAnchor
      :items="[...tableDocAnchorItems]"
      title="On This Page"
      responsive
      back-top
      back-top-mode="float"
    />
    <div class="table-feature">
      <TableBasicDemo />
      <TableGroupedDemo />
      <TablePaginationDemo />
      <TableOperationDemo />
      <TableApiSection />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.table-layout {
  position: relative;
}

.table-feature {
  display: grid;
  gap: 0.9rem;
  min-width: 0;
}

.table-feature > :deep(section) {
  min-width: 0;
  max-width: 100%;
}

.table-feature > :deep(section .demo-section) {
  max-width: 100%;
}
</style>
