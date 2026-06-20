<script setup lang="ts">
import { NebulaAnchor } from '@nebula-studio/nebula-ui';
import PaginationApiSection from './demos/PaginationApiSection.vue';
import PaginationStandaloneDemo from './demos/PaginationStandaloneDemo.vue';
import PaginationTableLinkageDemo from './demos/PaginationTableLinkageDemo.vue';
import { paginationDocAnchorItems } from './demos/paginationDocAnchors';
</script>

<template>
  <div class="pagination-layout nebula-anchor-rail">
    <NebulaAnchor
      :items="[...paginationDocAnchorItems]"
      title="On This Page"
      responsive
      back-top
      back-top-mode="float"
    />
    <div class="pagination-feature">
      <PaginationStandaloneDemo />
      <PaginationTableLinkageDemo />
      <PaginationApiSection />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pagination-layout {
  position: relative;
}

.pagination-feature {
  display: grid;
  gap: 0.9rem;
  min-width: 0;
}

.pagination-feature > :deep(section) {
  min-width: 0;
  max-width: 100%;
}

.pagination-feature > :deep(section .demo-section) {
  max-width: 100%;
}
</style>
