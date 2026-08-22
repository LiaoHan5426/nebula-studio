<script setup lang="ts">
import { computed } from 'vue';

import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui';

import { useOverlayTeleportTo } from '../../composables/useOverlayContainer';
import { cn } from '../../utils/cn';

const props = withDefaults(
  defineProps<{
    class?: string;
    contentClass?: string;
    description?: string;
    open?: boolean;
    size?: 'full' | 'lg' | 'md';
    title?: string;
  }>(),
  {
    open: false,
    title: '',
    description: '',
    class: '',
    contentClass: '',
    size: 'md',
  },
);

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const teleportTo = useOverlayTeleportTo();

const sizeClass = computed(() => {
  if (props.size === 'full') {
    return 'w-[min(96vw,75rem)] max-h-[92vh] overflow-hidden';
  }
  if (props.size === 'lg') {
    return 'w-[min(100vw-1.5rem,40rem)] max-h-[min(90vh,48rem)] overflow-y-auto';
  }
  return 'w-[min(100vw-1.5rem,32rem)] max-h-[min(90vh,40rem)] overflow-y-auto';
});

function handleOpenChange(open: boolean) {
  emit('update:open', open);
}
</script>

<template>
  <DialogRoot :open="props.open" @update:open="handleOpenChange">
    <slot name="trigger"></slot>

    <DialogPortal defer :to="teleportTo">
      <DialogOverlay
        class="fixed inset-0 z-overlay bg-overlay/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        :class="
          cn(
            'fixed left-1/2 top-1/2 z-modal grid -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 pr-12 text-foreground shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg',
            sizeClass,
            props.contentClass,
          )
        "
      >
        <DialogTitle
          v-if="title"
          class="text-lg font-semibold leading-none tracking-tight"
        >
          {{ title }}
        </DialogTitle>
        <DialogDescription
          :class="description ? 'text-sm text-muted-foreground' : 'sr-only'"
        >
          {{ description || title || '对话框' }}
        </DialogDescription>

        <slot></slot>

        <DialogClose
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-4"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span class="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
