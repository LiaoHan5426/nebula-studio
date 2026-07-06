<script setup lang="ts">
import { ref } from 'vue';
import { NebulaRadioGroup } from '@nebula-studio/nebula-ui';
import type { NebulaRadioOption } from '@nebula-studio/nebula-ui';

const selected = ref('a');
const options: NebulaRadioOption[] = [
  { value: 'a', label: '选项 A' },
  { value: 'b', label: '选项 B' },
  { value: 'c', label: '选项 C' },
  { value: 'd', label: '禁用项', disabled: true },
];
</script>

<template>
  <div>
    <NebulaRadioGroup v-model="selected" :options="options" />
    <p style="margin-top: 8px; font-size: 12px">当前选中: {{ selected }}</p>
  </div>
</template>
