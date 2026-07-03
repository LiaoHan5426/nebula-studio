<script lang="ts">
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
      },
      size: {
        default: 'h-9 px-4 py-2',
        icon: 'size-9',
        lg: 'h-10 rounded-md px-8',
        sm: 'h-8 rounded-md px-3 text-xs',
      },
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
</script>

<script setup lang="ts">
defineProps<{
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  as?: string;
}>();

defineEmits<{
  click: [value: MouseEvent];
}>();
</script>

<template>
  <component
    :is="as || 'button'"
    :class="cn(buttonVariants({ variant, size }))"
    @click="$emit('click', $event)"
  >
    <slot />
  </component>
</template>
