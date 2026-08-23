<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { NebulaButton, NebulaDialog } from '@nebula-studio/nebula-ui';

import {
  answerConfirm,
  useConfirmState,
} from '@/shared/composables/useConfirm';

const { t } = useI18n();
const state = useConfirmState();
</script>

<template>
  <NebulaDialog
    :open="state.open"
    :title="t('common.confirmTitle')"
    :description="state.message"
    @update:open="!$event && answerConfirm(false)"
  >
    <div class="confirm-dialog__impact">
      {{ t('common.confirmBody') }}
    </div>
    <div class="confirm-dialog__actions">
      <NebulaButton variant="secondary" @click="answerConfirm(false)">
        {{ t('common.cancel') }}
      </NebulaButton>
      <NebulaButton variant="primary" @click="answerConfirm(true)">
        {{ t('common.confirmAction') }}
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
