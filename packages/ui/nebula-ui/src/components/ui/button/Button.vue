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
