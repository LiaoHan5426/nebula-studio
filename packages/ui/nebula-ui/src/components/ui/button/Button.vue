<script lang="ts">
import { buttonVariants } from './types';
import type { ButtonVariants } from './types';
import { cn } from '../../../utils/cn';
</script>

<script setup lang="ts">
defineProps<{
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  as?: string;
}>();
</script>

<template>
  <component
    :is="as || 'button'"
    :data-ui-variant="variant ?? 'default'"
    :data-ui-size="size ?? 'default'"
    :class="cn('nebula-button-control', buttonVariants({ variant, size }))"
  >
    <slot />
  </component>
</template>

<style scoped>
.nebula-button-control {
  box-sizing: border-box;
  display: inline-flex;
  gap: 7px;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 7px 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--secondary-foreground));
  white-space: nowrap;
  cursor: pointer;
  background: hsl(var(--secondary));
  border: 1px solid transparent;
  border-radius: var(--radius-md, 8px);
  transition:
    transform 120ms ease,
    color 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.nebula-button-control:hover:not(:disabled) {
  background: hsl(var(--accent-hover));
}

.nebula-button-control:active:not(:disabled) {
  transform: translateY(1px);
}

.nebula-button-control:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px hsl(var(--ring) / 18%);
}

.nebula-button-control:disabled {
  cursor: not-allowed;
  opacity: 0.64;
}

.nebula-button-control[data-ui-variant='default'] {
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
  box-shadow: 0 7px 18px hsl(var(--primary) / 18%);
}

.nebula-button-control[data-ui-variant='default']:hover:not(:disabled) {
  background: hsl(var(--primary-hover));
}

.nebula-button-control[data-ui-variant='outline'] {
  color: hsl(var(--foreground));
  background: hsl(var(--card) / 55%);
  border-color: hsl(var(--border));
}

.nebula-button-control[data-ui-variant='ghost'] {
  color: hsl(var(--foreground));
  background: transparent;
}

.nebula-button-control[data-ui-size='sm'] {
  min-height: 30px;
  padding: 5px 10px;
  font-size: 12px;
}

.nebula-button-control[data-ui-size='icon'] {
  width: 36px;
  padding: 0;
}
</style>
