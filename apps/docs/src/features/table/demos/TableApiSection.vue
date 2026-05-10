<script setup lang="ts">
import { inject } from 'vue';
import { NebulaButton } from '@nebula-studio/nebula-ui';
import DocsApiTable from '../../../components/DocsApiTable.vue';
import { DOCS_NAVIGATE_TO_FEATURE } from '../../../docsNavigation';
import { tableComponentApiRows } from './tableApi';

const navigateToFeature = inject(DOCS_NAVIGATE_TO_FEATURE, null);
</script>

<template>
  <section id="table-api" class="table-api-section">
    <header class="table-api-intro">
      <h3 class="table-api-title">API 文档表格（DocsApiTable）</h3>
      <p class="table-api-desc">
        组件 props 说明由 <code>tableApi.ts</code> 统一维护，表格用于文档站展示。
      </p>
    </header>
    <DocsApiTable title="NebulaTable API" :rows="tableComponentApiRows" />
    <div class="table-api-pagination-nav">
      <p class="table-api-pagination-nav__text">
        <strong>NebulaPagination</strong>
        的 props / 事件说明与独立示例已集中到左侧菜单
        <strong> Data Display → Pagination </strong>。
      </p>
      <NebulaButton
        v-if="navigateToFeature"
        variant="secondary"
        class="table-api-pagination-nav__btn"
        @click="navigateToFeature('nebula-pagination')"
      >
        前往 Pagination 文档 →
      </NebulaButton>
    </div>
  </section>
</template>

<style scoped>
.table-api-section {
  display: grid;
  gap: 0.75rem;
}

.table-api-intro {
  margin-bottom: 0.15rem;
}

.table-api-title {
  margin: 0;
  font-size: 1rem;
  line-height: 1.3;
}

.table-api-desc {
  margin: 0.4rem 0 0;
  color: hsl(var(--muted-foreground));
  font-size: 0.88rem;
  line-height: 1.45;
}

.table-api-desc code {
  font-size: 0.86em;
}

.table-api-pagination-nav {
  margin-top: 0.35rem;
  padding: 0.75rem 0.85rem;
  border-radius: 10px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--muted) / 18%);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
}

.table-api-pagination-nav__text {
  margin: 0;
  flex: 1;
  min-width: 12rem;
  font-size: 0.88rem;
  line-height: 1.45;
  color: hsl(var(--muted-foreground));
}

.table-api-pagination-nav__btn {
  flex-shrink: 0;
}
</style>
