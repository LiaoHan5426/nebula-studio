<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

import { cn } from '../../../utils/cn';

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
    <slot></slot>
  </div>
</template>
