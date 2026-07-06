<script setup lang="ts">
import { ref } from 'vue';
import { NebulaSwitch } from '@nebula-studio/nebula-ui';

const switchValue = ref(false);
const switchValue2 = ref(true);
</script>

<template>
  <div>
    <div class="doc-demo-row">
      <NebulaSwitch v-model="switchValue" />
      <NebulaSwitch v-model="switchValue2" label="带标签" />
    </div>
    <p style="margin-top: 8px; font-size: 12px">
      状态: {{ switchValue }}, {{ switchValue2 }}
    </p>
  </div>
</template>
