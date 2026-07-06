<script setup lang="ts">
import { ref } from 'vue';
import { NebulaDrawer, NebulaButton } from '@nebula-studio/nebula-ui';

const leftDrawer = ref(false);
</script>

<template>
  <div>
    <NebulaButton variant="primary" @click="leftDrawer = true"
      >打开左侧抽屉</NebulaButton
    >
    <NebulaDrawer
      v-model:open="leftDrawer"
      title="左侧抽屉"
      placement="left"
      width="320px"
    >
      <p>从左侧滑出的抽屉面板。</p>
    </NebulaDrawer>
  </div>
</template>
