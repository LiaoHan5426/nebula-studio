<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

import { cn } from '../../../utils/cn';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <textarea
    :class="
      cn(
        'flex min-h-16 w-full min-w-0 rounded-md border border-input bg-input-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:border-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive',
        props.class,
      )
    "
  ></textarea>
</template>
