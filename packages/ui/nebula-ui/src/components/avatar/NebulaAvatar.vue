<script setup lang="ts">
import { computed } from 'vue';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { cn } from '../../utils/cn';

type AvatarSize = 'sm' | 'md' | 'lg';

const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    text?: string;
    size?: AvatarSize;
    online?: boolean;
    class?: string;
  }>(),
  {
    src: '',
    alt: '',
    text: '',
    size: 'md',
    online: false,
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
</script>

<template>
  <span :class="cn('relative inline-flex', props.class)">
    <Avatar :class="cn(sizeClasses[size])">
      <AvatarImage v-if="src" :src="src" :alt="alt || text" />
      <AvatarFallback>{{ fallbackText }}</AvatarFallback>
    </Avatar>
    <span
      v-if="online"
      :class="
        cn(
          'absolute bottom-0 right-0 block rounded-full ring-2 ring-background',
          size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-2.5 w-2.5' : 'h-3 w-3',
          'bg-green-500',
        )
      "
      aria-hidden="true"
    />
  </span>
</template>
