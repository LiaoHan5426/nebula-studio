<script setup lang="ts">
import { NebulaButton, NebulaPane } from '@nebula-studio/nebula-ui';

import {
  answerConfirm,
  useConfirmState,
} from '@/shared/composables/useConfirm';

const state = useConfirmState();
</script>

<template>
  <div
    v-if="state.open"
    class="confirm-overlay"
    role="dialog"
    aria-modal="true"
  >
    <NebulaPane class="confirm-dialog" title="确认">
      <p class="confirm-dialog__message">{{ state.message }}</p>
      <div class="confirm-dialog__actions">
        <NebulaButton variant="secondary" @click="answerConfirm(false)">
          取消
        </NebulaButton>
        <NebulaButton variant="primary" @click="answerConfirm(true)">
          确定
        </NebulaButton>
      </div>
    </NebulaPane>
  </div>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgb(8 10 18 / 52%);
  backdrop-filter: blur(2px);
}

.confirm-dialog {
  width: min(420px, 100%);
}

.confirm-dialog__message {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: hsl(var(--foreground));
}

.confirm-dialog__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
