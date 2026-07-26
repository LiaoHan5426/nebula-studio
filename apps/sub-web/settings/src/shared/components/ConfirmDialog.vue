<script setup lang="ts">
import { NebulaButton, NebulaDialog } from '@nebula-studio/nebula-ui';

import {
  answerConfirm,
  useConfirmState,
} from '@/shared/composables/useConfirm';

const state = useConfirmState();
</script>

<template>
  <NebulaDialog
    :open="state.open"
    title="确认操作"
    :description="state.message"
    @update:open="!$event && answerConfirm(false)"
  >
    <div class="confirm-dialog__impact">
      请确认你已了解该操作对关联对象和当前用户的影响。
    </div>
    <div class="confirm-dialog__actions">
      <NebulaButton variant="secondary" @click="answerConfirm(false)">
        取消
      </NebulaButton>
      <NebulaButton variant="primary" @click="answerConfirm(true)">
        确认执行
      </NebulaButton>
    </div>
  </NebulaDialog>
</template>

<style scoped>
.confirm-dialog__impact {
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 45%);
  border-radius: var(--radius-md);
}

.confirm-dialog__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
