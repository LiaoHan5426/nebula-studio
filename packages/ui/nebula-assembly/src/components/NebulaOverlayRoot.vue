<script setup lang="ts">
import { computed } from 'vue';

import { NebulaButton, NebulaDialog } from '@nebula-studio/nebula-ui';

import { tryUseNebulaAssembly } from '../context/useNebulaAssembly';

const overlay = tryUseNebulaAssembly()?.overlay;
const confirmOpen = computed(() => Boolean(overlay?.confirmState.open));
</script>

<template>
  <div
    v-if="overlay && confirmOpen"
    class="nebula-assembly__overlay-host"
    data-nebula-overlay-root
  >
    <NebulaDialog
      :open="overlay.confirmState.open"
      title="确认操作"
      :description="overlay.confirmState.message"
      @update:open="!$event && overlay.answerConfirm(false)"
    >
      <div class="nebula-assembly__confirm-impact">
        请确认你已了解该操作对关联对象和当前用户的影响。
      </div>
      <div class="nebula-assembly__confirm-actions">
        <NebulaButton variant="secondary" @click="overlay.answerConfirm(false)">
          取消
        </NebulaButton>
        <NebulaButton variant="primary" @click="overlay.answerConfirm(true)">
          确认执行
        </NebulaButton>
      </div>
    </NebulaDialog>
  </div>
</template>

<style scoped>
.nebula-assembly__overlay-host {
  position: absolute;
  z-index: var(--z-overlay, 1050);
  width: 0;
  height: 0;
  overflow: visible;
  pointer-events: none;
}

.nebula-assembly__overlay-host :deep([data-reka-dialog-content]),
.nebula-assembly__overlay-host :deep([data-reka-dialog-overlay]) {
  pointer-events: auto;
}

.nebula-assembly__confirm-impact {
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 45%);
  border-radius: var(--radius-md);
}

.nebula-assembly__confirm-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
