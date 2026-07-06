<script setup lang="ts">
import { ref } from 'vue';
import { NebulaTabs } from '@nebula-studio/nebula-ui';
import type { NebulaTabItem } from '@nebula-studio/nebula-ui';

const activeTab = ref('tab1');
const tabs: NebulaTabItem[] = [
  { value: 'tab1', label: '标签一' },
  { value: 'tab2', label: '标签二' },
  { value: 'tab3', label: '标签三' },
];
</script>

<template>
  <div>
    <NebulaTabs v-model="activeTab" :tabs="tabs" />
    <p style="margin-top: 12px">当前选中标签：{{ activeTab }}</p>
  </div>
</template>
