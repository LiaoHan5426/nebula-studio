<script lang="ts">
export interface ShellNotification {
  id: string;
  title: string;
  content: string;
  read?: boolean;
  createdAt: number;
  actionLabel?: string;
  viewId?: string;
  path?: string;
  severity?: 'info' | 'success' | 'warning' | 'danger';
}
</script>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { resolveShellEventBus } from '@nebula-studio/app-shell';
import type { ShellEventBus, ShellEventMap } from '@nebula-studio/app-shell';
import { NebulaButton, NebulaIcon } from '@nebula-studio/nebula-ui';

const emit = defineEmits<{
  activate: [notification: ShellNotification];
}>();

const bus = ref<ShellEventBus | null>(null);
const open = ref(false);
const items = ref<ShellNotification[]>([]);
let unsubscribe: (() => void) | null = null;

function pushNotification(
  payload: ShellEventMap['notification:received'],
): void {
  items.value.unshift({
    id: payload.id ?? `n-${Date.now()}`,
    title: payload.title ?? '通知',
    content: payload.content ?? '',
    read: false,
    createdAt: Date.now(),
    ...(payload.actionLabel ? { actionLabel: payload.actionLabel } : {}),
    ...(payload.viewId ? { viewId: payload.viewId } : {}),
    ...(payload.path ? { path: payload.path } : {}),
    ...(payload.severity ? { severity: payload.severity } : {}),
  });
  if (items.value.length > 50) {
    items.value.length = 50;
  }
}

function toggle(): void {
  open.value = !open.value;
}

function markAllRead(): void {
  items.value = items.value.map((n) => ({ ...n, read: true }));
}

const unreadCount = computed(() => items.value.filter((n) => !n.read).length);

function activate(item: ShellNotification): void {
  item.read = true;
  emit('activate', item);
  open.value = false;
}

onMounted(() => {
  bus.value = resolveShellEventBus();
  unsubscribe = bus.value.on('notification:received', pushNotification);
});

onUnmounted(() => {
  unsubscribe?.();
});
</script>

<template>
  <div class="notification-center">
    <button
      type="button"
      class="notification-center__trigger"
      aria-label="通知中心"
      @click="toggle"
    >
      <NebulaIcon icon="bell" />
      <span class="sr-only">通知</span>
      <span v-if="unreadCount > 0" class="notification-center__badge">
        {{ unreadCount }}
      </span>
    </button>
    <div v-if="open" class="notification-center__panel">
      <div class="notification-center__head">
        <strong>通知中心</strong>
        <NebulaButton size="sm" variant="ghost" @click="markAllRead">
          全部已读
        </NebulaButton>
      </div>
      <ul v-if="items.length" class="notification-center__list">
        <li
          v-for="item in items"
          :key="item.id"
          :class="{ 'is-read': item.read }"
        >
          <strong>{{ item.title }}</strong>
          <p>{{ item.content }}</p>
          <NebulaButton
            v-if="item.actionLabel && (item.viewId || item.path)"
            size="sm"
            variant="outline"
            @click="activate(item)"
          >
            {{ item.actionLabel }}
          </NebulaButton>
        </li>
      </ul>
      <p v-else class="notification-center__empty">暂无通知</p>
    </div>
  </div>
</template>

<style scoped>
.notification-center {
  position: relative;
}

.notification-center__trigger {
  position: relative;
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  color: hsl(var(--foreground));
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
}

.notification-center__trigger:hover {
  background: hsl(var(--muted) / 50%);
  border-color: hsl(var(--border));
}

.notification-center__badge {
  position: absolute;
  top: -3px;
  right: -3px;
  min-width: 1.1rem;
  padding: 1px 4px;
  font-size: 0.65rem;
  color: white;
  text-align: center;
  background: hsl(var(--danger));
  border-radius: 999px;
}

.notification-center__panel {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  z-index: 50;
  width: min(22rem, calc(100vw - var(--space-8)));
  padding: var(--space-3);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-overlay);
}

.notification-center__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notification-center__list {
  display: grid;
  gap: var(--space-2);
  max-height: 22rem;
  padding: 0;
  margin: var(--space-2) 0 0;
  overflow: auto;
  list-style: none;
}

.notification-center__list li {
  padding: var(--space-3);
  background: hsl(var(--primary) / 6%);
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
}

.notification-center__list li.is-read {
  background: hsl(var(--muted) / 25%);
  opacity: 0.72;
}

.notification-center__list p,
.notification-center__empty {
  margin: var(--space-1) 0 var(--space-2);
  font-size: var(--font-size-caption);
  color: hsl(var(--muted-foreground));
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip-path: inset(50%);
}
</style>
