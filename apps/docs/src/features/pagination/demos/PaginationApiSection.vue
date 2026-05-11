<script setup lang="ts">
import DocsApiTable from '../../../components/DocsApiTable.vue';
import { paginationComponentApiRows } from './paginationApi';
</script>

<template>
  <section id="pagination-api" class="pagination-api-section">
    <header class="pagination-api-intro">
      <h3 class="pagination-api-title">NebulaPagination API</h3>
      <p class="pagination-api-desc">
        说明由 <code>paginationApi.ts</code> 维护；实现见
        <code>packages/nebula-ui/src/components/NebulaPagination.ts</code>。
      </p>
    </header>
    <DocsApiTable title="NebulaPagination" :rows="paginationComponentApiRows" />
  </section>
</template>

<style lang="scss" scoped>
.pagination-api-section {
  display: grid;
  gap: 0.75rem;
}

.pagination-api-intro {
  margin-bottom: 0.15rem;
}

.pagination-api-title {
  margin: 0;
  font-size: 1rem;
  line-height: 1.3;
}

.pagination-api-desc {
  margin: 0.4rem 0 0;
  color: hsl(var(--muted-foreground));
  font-size: 0.88rem;
  line-height: 1.45;
}

.pagination-api-desc code {
  font-size: 0.86em;
}
</style>
