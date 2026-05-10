<script setup lang="ts">
import { NebulaPane } from '@nebula-studio/nebula-ui';
import DocsApiTable from '../../components/DocsApiTable.vue';
import PlaceholderIntroDemo from './demos/PlaceholderIntroDemo.vue';
import { placeholderApiRows } from './demos/placeholderApi';
</script>

<template>
  <section class="placeholder-stack">
    <PlaceholderIntroDemo />
    <NebulaPane class="placeholder-card" title="开发建议">
      <p>可按 Element Plus 风格补充 API、示例代码块与注意事项。</p>
    </NebulaPane>
    <DocsApiTable title="接入约定" :rows="placeholderApiRows" />
  </section>
</template>

<style scoped>
.placeholder-stack {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.placeholder-card {
  margin-top: 0;
}

.placeholder-card p {
  margin: 0;
  color: hsl(var(--muted-foreground));
}
</style>
