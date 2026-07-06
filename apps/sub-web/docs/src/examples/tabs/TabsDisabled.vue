<script setup lang="ts">
import { ref } from 'vue';
import { NebulaTabs } from '@nebula-studio/nebula-ui';
import type { NebulaTabItem } from '@nebula-studio/nebula-ui';

const activeTab = ref('a');
const tabs: NebulaTabItem[] = [
  { value: 'a', label: '可用' },
  { value: 'b', label: '禁用', disabled: true },
  { value: 'c', label: '其他' },
];
</script>

<template>
  <NebulaTabs v-model="activeTab" :tabs="tabs" />
</template>
