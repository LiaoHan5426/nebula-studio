<script setup lang="ts">
import { NebulaPane } from '@nebula-studio/nebula-ui';
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
import notifyResponseLogCode from './notify-response-log.code.md?raw';

defineProps<{
  lines: string[];
}>();

const code = notifyResponseLogCode;
</script>

<template>
  <DocsDemoSection
    title="Detail Response Log"
    description="展示 Notify 详情 / 回调产生的调试日志行。"
    :code="code"
  >
    <NebulaPane
      v-if="lines.length > 0"
      class="response-log"
      title="Detail Response Log"
    >
      <p v-for="line in lines" :key="line">
        {{ line }}
      </p>
    </NebulaPane>
  </DocsDemoSection>
</template>

<style scoped>
.response-log {
  margin-top: 0.35rem;
}

.response-log p {
  margin: 0.24rem 0;
  font-size: 0.88rem;
  color: hsl(var(--muted-foreground));
  line-height: 1.45;
}
</style>
