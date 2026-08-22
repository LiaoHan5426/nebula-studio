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
    closeOnEscape?: boolean;
    closeOnOverlay?: boolean;
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
    closeOnOverlay: true,
    closeOnEscape: true,
  },
);

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const teleportTo = useOverlayTeleportTo();

const sizeClass = computed(() => {
  if (props.size === 'full') {
    return 'nebula-dialog--full';
  }
  if (props.size === 'lg') {
    return 'nebula-dialog--lg';
  }
  return 'nebula-dialog--md';
});

function handleOpenChange(open: boolean) {
  emit('update:open', open);
}

function onPointerDownOutside(event: Event) {
  if (!props.closeOnOverlay) event.preventDefault();
}

function onInteractOutside(event: Event) {
  if (!props.closeOnOverlay) event.preventDefault();
}

function onEscapeKeyDown(event: Event) {
  if (!props.closeOnEscape) event.preventDefault();
}
</script>

<template>
  <DialogRoot :open="props.open" @update:open="handleOpenChange">
    <slot name="trigger"></slot>

    <DialogPortal defer :to="teleportTo">
      <DialogOverlay class="nebula-dialog-overlay" />
      <DialogContent
        :class="cn('nebula-dialog', sizeClass, props.contentClass)"
        @pointer-down-outside="onPointerDownOutside"
        @interact-outside="onInteractOutside"
        @escape-key-down="onEscapeKeyDown"
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

        <DialogClose class="nebula-dialog__close">
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
