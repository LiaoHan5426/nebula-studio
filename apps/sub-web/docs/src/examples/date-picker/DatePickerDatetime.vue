<script setup lang="ts">
import { ref } from 'vue';
import { NebulaDatePicker } from '@nebula-studio/nebula-ui';

const datetimeValue = ref<string | null>(null);
</script>

<template>
  <div>
    <NebulaDatePicker
      v-model="datetimeValue"
      type="datetime"
      placeholder="选择日期时间"
    />
    <p style="margin-top: 12px">选中值：{{ datetimeValue ?? '未选择' }}</p>
  </div>
</template>
