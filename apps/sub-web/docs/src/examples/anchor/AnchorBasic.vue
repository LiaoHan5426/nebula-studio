<script setup lang="ts">
import { NebulaAnchor } from '@nebula-studio/nebula-ui';
import type { NebulaAnchorItem } from '@nebula-studio/nebula-ui';

const items: NebulaAnchorItem[] = [
  { id: 'basic', label: '基础用法' },
  { id: 'custom', label: '自定义标题' },
  { id: 'scroll', label: '滚动追踪' },
  { id: 'api', label: 'API' },
];
</script>

<template>
  <div style="display: flex; gap: 24px">
    <NebulaAnchor :items="items" :track-scroll="false" />
    <div style="flex: 1">
      <p>点击左侧导航项可跳转到对应锚点。</p>
    </div>
  </div>
</template>
