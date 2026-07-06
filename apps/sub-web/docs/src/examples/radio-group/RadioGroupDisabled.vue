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
  <NebulaRadioGroup v-model="selected" :options="options" disabled />
</template>
