<script setup lang="ts">
import { ref } from 'vue';
import { NebulaDatePicker } from '@nebula-studio/nebula-ui';

const dateValue = ref<string | null>(null);
</script>

<template>
  <div>
    <NebulaDatePicker v-model="dateValue" placeholder="选择日期" />
    <p style="margin-top: 12px">选中值：{{ dateValue ?? '未选择' }}</p>
  </div>
</template>
