<script lang="ts">
export interface ShellNotification {
  id: string;
  title: string;
  content: string;
  read?: boolean;
  createdAt: number;
}
</script>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { resolveShellEventBus } from '@nebula-studio/app-shell';
import type { ShellEventBus } from '@nebula-studio/app-shell';

const bus = ref<ShellEventBus | null>(null);
const open = ref(false);
const items = ref<ShellNotification[]>([]);
let unsubscribe: (() => void) | null = null;

function pushNotification(payload: {
  title?: string;
  content?: string;
  id?: string;
}) {
  items.value.unshift({
    id: payload.id ?? `n-${Date.now()}`,
    title: payload.title ?? '通知',
    content: payload.content ?? '',
    read: false,
    createdAt: Date.now(),
  });
  if (items.value.length > 50) {
    items.value.length = 50;
  }
}

function toggle() {
  open.value = !open.value;
}

function markAllRead() {
  items.value = items.value.map((n) => ({ ...n, read: true }));
}

function unreadCount() {
  return items.value.filter((n) => !n.read).length;
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
  <div class="relative">
    <button
      type="button"
      class="rounded-md px-2 py-1 text-sm hover:bg-black/5"
      aria-label="通知中心"
      @click="toggle"
    >
      通知
      <span
        v-if="unreadCount() > 0"
        class="ml-1 rounded-full bg-red-500 px-1.5 text-xs text-white"
      >
        {{ unreadCount() }}
      </span>
    </button>
    <div
      v-if="open"
      class="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
    >
      <div class="mb-2 flex items-center justify-between">
        <span class="font-medium">通知中心</span>
        <button
          type="button"
          class="text-xs text-blue-600"
          @click="markAllRead"
        >
          全部已读
        </button>
      </div>
      <ul v-if="items.length" class="max-h-64 space-y-2 overflow-y-auto">
        <li
          v-for="item in items"
          :key="item.id"
          class="rounded border border-gray-100 p-2 text-sm"
          :class="{ 'opacity-60': item.read }"
        >
          <div class="font-medium">{{ item.title }}</div>
          <div class="text-gray-600">{{ item.content }}</div>
        </li>
      </ul>
      <p v-else class="text-sm text-gray-500">暂无通知</p>
    </div>
  </div>
</template>
