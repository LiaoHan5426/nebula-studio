<script setup lang="ts">
import { ref } from 'vue';
import { NebulaCheckbox } from '@nebula-studio/nebula-ui';

const checked = ref(false);
const checked2 = ref(true);
</script>

<template>
  <div>
    <div class="doc-demo-row">
      <NebulaCheckbox v-model="checked">选项一</NebulaCheckbox>
      <NebulaCheckbox v-model="checked2">选项二（已选中）</NebulaCheckbox>
      <NebulaCheckbox disabled>禁用项</NebulaCheckbox>
    </div>
    <p style="margin-top: 8px; font-size: 12px">
      状态: {{ checked }}, {{ checked2 }}
    </p>
  </div>
</template>
