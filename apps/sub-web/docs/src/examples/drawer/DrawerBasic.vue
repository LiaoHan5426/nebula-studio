<script setup lang="ts">
import { ref } from 'vue';
import { NebulaDrawer, NebulaButton } from '@nebula-studio/nebula-ui';

const drawerOpen = ref(false);
</script>

<template>
  <div>
    <NebulaButton @click="drawerOpen = true">打开右侧抽屉</NebulaButton>
    <NebulaDrawer
      v-model:open="drawerOpen"
      title="抽屉标题"
      subtitle="副标题说明"
    >
      <p>这里是抽屉的内容区域。</p>
      <p style="margin-top: 8px">可以在这里放置任意内容。</p>
    </NebulaDrawer>
  </div>
</template>
