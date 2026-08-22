<script setup lang="ts">
import { computed } from 'vue';

import { cn } from '../../utils/cn';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type AvatarSize = 'lg' | 'md' | 'sm';
type AvatarStatus = 'away' | 'busy' | 'offline' | 'online';

const props = withDefaults(
  defineProps<{
    alt?: string;
    class?: string;
    online?: boolean;
    size?: AvatarSize;
    src?: string;
    status?: AvatarStatus;
    statusLabel?: string;
    text?: string;
  }>(),
  {
    src: '',
    alt: '',
    text: '',
    size: 'md',
    online: false,
    status: undefined,
    statusLabel: '',
    class: '',
  },
);

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
};

const fallbackText = computed(() => {
  const raw = props.text.trim() || props.alt.trim();
  if (!raw) return '?';
  return raw.slice(0, 1).toUpperCase();
});

const resolvedStatus = computed<AvatarStatus | undefined>(
  () => props.status ?? (props.online ? 'online' : undefined),
);
const resolvedStatusLabel = computed(
  () =>
    props.statusLabel ||
    ({ online: '在线', offline: '离线', away: '离开', busy: '忙碌' } as const)[
      resolvedStatus.value ?? 'offline'
    ],
);
</script>

<template>
  <span
    :class="
      cn('nebula-avatar-wrap', `nebula-avatar-wrap--${size}`, props.class)
    "
  >
    <Avatar :class="cn(sizeClasses[size])">
      <AvatarImage v-if="src" :src="src" :alt="alt || text" />
      <AvatarFallback>{{ fallbackText }}</AvatarFallback>
    </Avatar>
    <span
      v-if="resolvedStatus"
      :class="
        cn('nebula-avatar__status', `nebula-avatar__status--${resolvedStatus}`)
      "
      role="status"
      :title="resolvedStatusLabel"
      :aria-label="resolvedStatusLabel"
      ><span class="sr-only">{{ resolvedStatusLabel }}</span></span
    >
  </span>
</template>

<style scoped>
.nebula-avatar-wrap {
  position: relative;
  display: inline-flex;
  overflow: visible;
}

.nebula-avatar__status {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: block;
  width: 8px;
  height: 8px;
  pointer-events: none;
  border-radius: 999px;
  box-shadow:
    0 0 0 2px hsl(var(--background)),
    0 0 0 1px hsl(var(--border));
}

.nebula-avatar-wrap--sm .nebula-avatar__status {
  width: 7px;
  height: 7px;
}

.nebula-avatar-wrap--lg .nebula-avatar__status {
  width: 10px;
  height: 10px;
}

.nebula-avatar__status--online {
  background: #22c55e;
}

.nebula-avatar__status--offline {
  background: #94a3b8;
}

.nebula-avatar__status--away {
  background: #f59e0b;
}

.nebula-avatar__status--busy {
  background: #ef4444;
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
