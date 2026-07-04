<script lang="ts" setup>
import { cn } from '../../../utils/cn';
import type { HTMLAttributes } from 'vue';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    :class="
      cn('rounded-xl border bg-card text-card-foreground shadow', props.class)
    "
  >
    <slot />
  </div>
</template>
