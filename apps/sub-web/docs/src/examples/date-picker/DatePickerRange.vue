<script setup lang="ts">
import { ref } from 'vue';
import { NebulaDatePicker } from '@nebula-studio/nebula-ui';

const rangeValue = ref<[string, string] | null>(null);
</script>

<template>
  <div>
    <NebulaDatePicker
      v-model="rangeValue"
      type="datetimerange"
      placeholder="选择范围"
    />
    <p style="margin-top: 12px">
      选中值：{{ rangeValue ? rangeValue.join(' ~ ') : '未选择' }}
    </p>
  </div>
</template>
