```vue
<script setup lang="ts">
import { NebulaPane } from '@nebula-studio/nebula-ui';

defineProps<{
  lines: string[];
}>();
</script>

<template>
  <NebulaPane
    v-if="lines.length > 0"
    class="response-log"
    title="Detail Response Log"
  >
    <p v-for="line in lines" :key="line">
      {{ line }}
    </p>
  </NebulaPane>
</template>

<style scoped>
.response-log p {
  margin: 0.24rem 0;
  font-size: 0.88rem;
  color: hsl(var(--muted-foreground));
}
</style>
```

父级将 Notify 详情接口返回的日志行传入 `lines`，用于调试 payload / 回调。
