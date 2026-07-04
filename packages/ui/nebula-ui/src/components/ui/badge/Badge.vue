<script lang="ts">
import { badgeVariants } from './types';
import type { BadgeVariants } from './types';
import { cn } from '../../../utils/cn';
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
