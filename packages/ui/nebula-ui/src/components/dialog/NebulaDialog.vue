<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui';
import { cn } from '../../utils/cn';

const props = withDefaults(
  defineProps<{
    open?: boolean;
    title?: string;
    description?: string;
    class?: string;
    contentClass?: string;
  }>(),
  {
    open: false,
    title: '',
    description: '',
    class: '',
    contentClass: '',
  },
);

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

function handleOpenChange(open: boolean) {
  emit('update:open', open);
}
</script>

<template>
  <DialogRoot :open="props.open" @update:open="handleOpenChange">
    <slot name="trigger" />

    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        :class="
          cn(
            'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg',
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
          v-if="description"
          class="text-sm text-muted-foreground"
        >
          {{ description }}
        </DialogDescription>

        <slot />

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
