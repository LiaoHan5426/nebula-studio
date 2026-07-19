<script setup lang="ts">
import { computed } from 'vue';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { cn } from '../../utils/cn';

type AvatarSize = 'sm' | 'md' | 'lg';
type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    text?: string;
    size?: AvatarSize;
    online?: boolean;
    status?: AvatarStatus;
    statusLabel?: string;
    class?: string;
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
  <span :class="cn('relative inline-flex', props.class)">
    <Avatar :class="cn(sizeClasses[size])">
      <AvatarImage v-if="src" :src="src" :alt="alt || text" />
      <AvatarFallback>{{ fallbackText }}</AvatarFallback>
    </Avatar>
    <span
      v-if="resolvedStatus"
      :class="
        cn(
          'nebula-avatar__status absolute bottom-0 right-0 block rounded-full ring-2 ring-background',
          size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-2.5 w-2.5' : 'h-3 w-3',
          `nebula-avatar__status--${resolvedStatus}`,
        )
      "
      role="status"
      :title="resolvedStatusLabel"
      :aria-label="resolvedStatusLabel"
      ><span class="sr-only">{{ resolvedStatusLabel }}</span></span
    >
  </span>
</template>

<style scoped>
.nebula-avatar__status {
  box-shadow: 0 0 0 1px hsl(var(--border));
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
