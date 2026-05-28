<script setup lang="ts">
import DocsApiTable from '../../../components/DocsApiTable.vue';
import { sqlAgentApiRows, sqlAgentTypeRows } from './sqlAgentApi';
</script>

<template>
  <section id="sql-agent-api">
    <DocsApiTable title="SQL Agent API" :rows="sqlAgentApiRows" />
    <DocsApiTable title="类型定义" :rows="sqlAgentTypeRows" />
  </section>
</template>

<style lang="scss" scoped>
#sql-agent-api {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
</style>
