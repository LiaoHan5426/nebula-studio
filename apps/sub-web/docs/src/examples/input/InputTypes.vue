<script setup lang="ts">
import { NebulaInput } from '@nebula-studio/nebula-ui';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <NebulaInput type="text" placeholder="文本输入" />
    <NebulaInput type="password" placeholder="密码输入" />
    <NebulaInput type="email" placeholder="邮箱输入" />
    <NebulaInput type="number" placeholder="数字输入" />
  </div>
</template>
