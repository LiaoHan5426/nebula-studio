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
    section-id="notify-response-log"
    title="Detail Response Log"
    description="展示 Notify 详情 / 回调产生的调试日志行。"
    :code="code"
  >
    <NebulaPane class="response-log" title="Detail Response Log">
      <template v-if="lines.length > 0">
        <p v-for="line in lines" :key="line">
          {{ line }}
        </p>
      </template>
      <p v-else class="response-log__empty">
        暂无日志。请使用上方「Notification Permission
        Detail」等带详情与回调的按钮，在弹窗中提交选项后，IPC
        响应会以文本行追加在此（最多保留 6 条）。
      </p>
    </NebulaPane>
  </DocsDemoSection>
</template>

<style lang="scss" scoped>
.response-log {
  margin-top: 0.35rem;
}

.response-log p {
  margin: 0.24rem 0;
  font-size: 0.88rem;
  color: hsl(var(--muted-foreground));
  line-height: 1.45;
}

.response-log__empty {
  margin: 0;
  font-size: 0.86rem;
  color: hsl(var(--muted-foreground));
  line-height: 1.5;
}
</style>
