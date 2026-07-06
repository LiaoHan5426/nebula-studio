<script setup lang="ts">
import { ref } from 'vue';
import { NebulaInput } from '@nebula-studio/nebula-ui';

const disabledValue = ref('禁用状态');
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <NebulaInput v-model="disabledValue" disabled />
    <NebulaInput readonly value="只读状态" />
  </div>
</template>
