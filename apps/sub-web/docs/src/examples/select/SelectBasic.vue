<script setup lang="ts">
import { ref } from 'vue';
import { NebulaSelect } from '@nebula-studio/nebula-ui';

const selected = ref('');
const options = [
  { label: '选项一', value: '1' },
  { label: '选项二', value: '2' },
  { label: '选项三', value: '3' },
  { label: '禁用项', value: '4', disabled: true },
];
</script>

<template>
  <div>
    <NebulaSelect v-model="selected" :options="options" placeholder="请选择" />
    <p style="margin-top: 8px; font-size: 12px">
      当前选中: {{ selected || '未选择' }}
    </p>
  </div>
</template>
