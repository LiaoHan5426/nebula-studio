<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import { ProgressRoot, ProgressIndicator } from 'reka-ui';
import type { ProgressRootProps } from 'reka-ui';
import { cn } from '../../../utils/cn';

defineProps<ProgressRootProps & { class?: HTMLAttributes['class'] }>();
</script>

<template>
  <ProgressRoot
    v-bind="$props"
    :class="
      cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
        $attrs.class as string,
      )
    "
  >
    <ProgressIndicator class="h-full w-full flex-1 bg-primary transition-all" />
  </ProgressRoot>
</template>
