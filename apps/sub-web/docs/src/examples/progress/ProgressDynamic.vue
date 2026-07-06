<script setup lang="ts">
import { ref } from 'vue';
import { NebulaProgress, NebulaButton } from '@nebula-studio/nebula-ui';

const dynamicValue = ref(30);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <NebulaProgress v-model="dynamicValue" />
    <div style="display: flex; gap: 8px; align-items: center">
      <NebulaButton @click="dynamicValue = Math.max(0, dynamicValue - 10)"
        >-10</NebulaButton
      >
      <NebulaButton
        variant="primary"
        @click="dynamicValue = Math.min(100, dynamicValue + 10)"
        >+10</NebulaButton
      >
      <span style="font-size: 12px; color: hsl(var(--muted-foreground))"
        >{{ dynamicValue }}%</span
      >
    </div>
  </div>
</template>
