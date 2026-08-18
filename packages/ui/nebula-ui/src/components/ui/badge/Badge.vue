<script lang="ts">
import type { BadgeVariants } from './types';

import { cn } from '../../../utils/cn';
import { badgeVariants } from './types';
</script>

<script setup lang="ts">
defineProps<{
  variant?: BadgeVariants['variant'];
}>();
</script>

<template>
  <div
    :data-ui-variant="variant ?? 'default'"
    :class="
      cn('nebula-badge', badgeVariants({ variant }), $attrs.class as string)
    "
  >
    <slot></slot>
  </div>
</template>
