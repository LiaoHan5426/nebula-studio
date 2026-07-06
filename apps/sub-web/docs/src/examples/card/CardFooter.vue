<script setup lang="ts">
import { NebulaButton, NebulaCard } from '@nebula-studio/nebula-ui';
</script>

<template>
  <NebulaCard title="带底部">
    <p>卡片内容</p>
    <template #footer>
      <div style="display: flex; gap: 8px; justify-content: flex-end">
        <NebulaButton>取消</NebulaButton>
        <NebulaButton variant="primary">确认</NebulaButton>
      </div>
    </template>
  </NebulaCard>
</template>
