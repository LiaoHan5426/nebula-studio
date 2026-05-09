<script setup lang="ts">
import type { ToastItem } from '@nebula-studio-electron/electron-shared';
import { NebulaButton, NebulaPane, NebulaTag } from '@nebula-studio/nebula-ui';

defineProps<{
  messageToasts: ToastItem[];
  notificationToasts: ToastItem[];
  detailModalToast: ToastItem | null;
}>();

const emit = defineEmits<{
  remove: [id: number];
  openDetail: [toast: ToastItem];
  submitDetailAction: [action: string];
}>();
</script>

<template>
  <div class="toast-stack toast-stack-message">
    <article
      v-for="toast in messageToasts"
      :key="toast.id"
      class="toast"
      :class="`toast-${toast.level}`"
    >
      <header class="toast-head">
        <strong>{{ toast.title ?? 'In-app notify' }}</strong>
        <NebulaTag variant="info"
          >{{ toast.type }} / {{ toast.level }}</NebulaTag
        >
      </header>
      <p>{{ toast.message }}</p>
      <NebulaButton
        v-if="toast.showCloseButton"
        class="toast-close"
        variant="ghost"
        @click="emit('remove', toast.id)"
      >
        ×
      </NebulaButton>
    </article>
  </div>
  <div class="toast-stack toast-stack-notification">
    <article
      v-for="toast in notificationToasts"
      :key="toast.id"
      class="toast"
      :class="[`toast-${toast.level}`, toast.detail ? 'toast-clickable' : '']"
      @click="emit('openDetail', toast)"
    >
      <header class="toast-head">
        <strong>{{ toast.title ?? 'In-app notify' }}</strong>
        <NebulaTag variant="info"
          >{{ toast.type }} / {{ toast.level }}</NebulaTag
        >
      </header>
      <p>{{ toast.message }}</p>
      <NebulaButton
        v-if="toast.showCloseButton"
        class="toast-close"
        variant="ghost"
        @click.stop="emit('remove', toast.id)"
      >
        ×
      </NebulaButton>
    </article>
  </div>
  <div v-if="detailModalToast?.detail" class="detail-mask">
    <NebulaPane class="detail-modal" :title="detailModalToast.detail.title">
      <p>{{ detailModalToast.detail.content }}</p>
      <div
        v-if="detailModalToast.detail.mode === 'choice'"
        class="detail-actions"
      >
        <NebulaButton
          v-for="choice in detailModalToast.detail.choices ?? []"
          :key="choice.key"
          :variant="choice.variant === 'danger' ? 'ghost' : 'primary'"
          :class="`detail-btn${choice.variant ? ` detail-btn-${choice.variant}` : ''}`"
          @click="emit('submitDetailAction', choice.key)"
        >
          {{ choice.label }}
        </NebulaButton>
      </div>
      <div v-else class="detail-actions">
        <NebulaButton
          class="detail-btn detail-btn-primary"
          variant="primary"
          @click="emit('submitDetailAction', 'ack')"
        >
          {{ detailModalToast.detail.confirmText ?? '知道了' }}
        </NebulaButton>
      </div>
    </NebulaPane>
  </div>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: min(360px, calc(100vw - 2rem));
}

.toast-stack-message {
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.toast-stack-notification {
  top: 1rem;
  right: 1rem;
}

.toast {
  position: relative;
  padding: 0.65rem 2rem 0.75rem 0.75rem;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-left-width: 4px;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 25%);
}

.toast-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.toast p {
  margin: 0;
  color: hsl(var(--foreground));
}

.toast-close {
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  min-width: 24px;
  min-height: 24px;
  padding: 0.12rem;
  line-height: 1;
}

.toast-clickable {
  cursor: pointer;
}

.toast-clickable:hover {
  background: hsl(var(--muted) / 55%);
}

.toast-success {
  border-left-color: hsl(var(--success));
}

.toast-info {
  border-left-color: hsl(var(--primary));
}

.toast-warning {
  border-left-color: hsl(var(--warning));
}

.toast-danger {
  border-left-color: hsl(var(--destructive));
}

.detail-mask {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(6 8 15 / 55%);
}

.detail-modal {
  width: min(520px, calc(100vw - 2rem));
}

.detail-modal p {
  margin: 0;
  color: hsl(var(--foreground));
  white-space: pre-wrap;
}

.detail-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.detail-btn-danger {
  color: hsl(var(--destructive-foreground));
  background: hsl(var(--destructive));
  border-color: hsl(var(--destructive) / 70%);
}
</style>
