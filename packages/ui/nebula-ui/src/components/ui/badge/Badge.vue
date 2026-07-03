<script lang="ts">
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

export const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-1 focus:ring-ring focus:outline-none',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow-sm',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow-sm',
        outline: 'text-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        success: 'border-transparent bg-success text-success-foreground',
        warning: 'border-transparent bg-warning text-warning-foreground',
      },
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
</script>

<script setup lang="ts">
defineProps<{
  variant?: BadgeVariants['variant'];
}>();
</script>

<template>
  <div :class="cn(badgeVariants({ variant }), $attrs.class as string)">
    <slot />
  </div>
</template>
