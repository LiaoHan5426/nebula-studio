<script setup lang="ts">
import DocsApiTable from '../../../../components/DocsApiTable.vue';
import {
  sqlAgentApiRows,
  sqlAgentTypeRows,
  sqlCryptoApiRows,
  sqlCryptoTypeRows,
} from './api';
</script>

<template>
  <section id="sql-agent-api">
    <DocsApiTable title="SQL Agent API" :rows="sqlAgentApiRows" />
    <DocsApiTable title="SQL 加密工具 API" :rows="sqlCryptoApiRows" />
    <DocsApiTable
      title="类型定义"
      :rows="[...sqlAgentTypeRows, ...sqlCryptoTypeRows]"
    />
  </section>
</template>

<style lang="scss" scoped>
#sql-agent-api {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
</style>
