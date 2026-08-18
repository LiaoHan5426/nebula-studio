<script lang="ts">
import type { ButtonVariants } from './types';

import { cn } from '../../../utils/cn';
import { buttonVariants } from './types';
</script>

<script setup lang="ts">
defineProps<{
  as?: string;
  size?: ButtonVariants['size'];
  variant?: ButtonVariants['variant'];
}>();
</script>

<template>
  <component
    :is="as || 'button'"
    :data-ui-variant="variant ?? 'default'"
    :data-ui-size="size ?? 'default'"
    :class="cn('nebula-button-control', buttonVariants({ variant, size }))"
  >
    <slot></slot>
  </component>
</template>
