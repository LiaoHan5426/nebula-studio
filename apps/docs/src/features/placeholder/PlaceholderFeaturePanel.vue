<script setup lang="ts">
import { NebulaPane } from '@nebula-studio/nebula-ui';
</script>

<template>
  <NebulaPane
    class="placeholder-card"
    title="功能验证位"
    description="这里用于挂载下一个独立验证模块（如权限流、更新流、配置流）。"
  >
    <p>建议新增 `features/&lt;name&gt;` 并添加 `feature.ts` 自动接入菜单树。</p>
  </NebulaPane>
</template>

<style scoped>
.placeholder-card {
  margin-top: 1rem;
}

.placeholder-card p {
  margin: 0;
  color: hsl(var(--muted-foreground));
}
</style>
