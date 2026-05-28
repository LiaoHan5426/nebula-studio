<script setup lang="ts">
import { NebulaAnchor } from '@nebula-studio/nebula-ui';
import SQLAgentDemo from './demos/SQLAgentDemo.vue';
import SQLAgentApiSection from './demos/SQLAgentApiSection.vue';
import { sqlAgentDocAnchorItems } from './demos/sqlAgentDocAnchors';
</script>

<template>
  <div class="sql-agent-layout">
    <NebulaAnchor
      :items="[...sqlAgentDocAnchorItems]"
      title="On This Page"
      responsive
      back-top
      back-top-mode="float"
    />
    <div class="sql-agent-feature">
      <SQLAgentDemo />
      <SQLAgentApiSection />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sql-agent-layout {
  position: relative;
}

.sql-agent-feature {
  display: grid;
  gap: 0.9rem;
  min-width: 0;
}

.sql-agent-feature > :deep(section) {
  min-width: 0;
  max-width: 100%;
}

.sql-agent-feature > :deep(section .demo-section) {
  max-width: 100%;
}
</style>