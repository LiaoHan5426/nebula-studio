<script setup lang="ts">
import { NebulaAnchor, NebulaPane } from '@nebula-studio/nebula-ui';
import DocsApiTable from '../../components/DocsApiTable.vue';
import { placeholderDocAnchorItems } from './demos/placeholderDocAnchors';
import PlaceholderIntroDemo from './demos/PlaceholderIntroDemo.vue';
import { placeholderApiRows } from './demos/placeholderApi';
</script>

<template>
  <div class="placeholder-layout nebula-anchor-rail">
    <NebulaAnchor
      :items="[...placeholderDocAnchorItems]"
      title="On This Page"
      responsive
      back-top
      back-top-mode="float"
    />
    <section class="placeholder-stack">
      <PlaceholderIntroDemo />
      <section id="placeholder-dev" class="placeholder-dev">
        <NebulaPane class="placeholder-card" title="开发建议">
          <p>可按 Element Plus 风格补充 API、示例代码块与注意事项。</p>
        </NebulaPane>
      </section>
      <DocsApiTable
        section-id="placeholder-api"
        title="接入约定"
        :rows="placeholderApiRows"
      />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.placeholder-layout {
  position: relative;
}

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
