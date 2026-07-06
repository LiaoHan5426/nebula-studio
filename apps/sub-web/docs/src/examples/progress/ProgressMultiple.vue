<script setup lang="ts">
import { NebulaProgress } from '@nebula-studio/nebula-ui';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <NebulaProgress :model-value="20" />
    <NebulaProgress :model-value="60" />
    <NebulaProgress :model-value="100" />
  </div>
</template>
