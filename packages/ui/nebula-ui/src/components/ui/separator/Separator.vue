<script setup lang="ts">
import { cn } from '../../../utils/cn';
import { Separator } from 'reka-ui';
import type { SeparatorProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

defineProps<SeparatorProps & { class?: HTMLAttributes['class'] }>();
</script>

<template>
  <Separator
    v-bind="$props"
    :class="
      cn(
        'shrink-0 bg-border',
        $attrs.orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full',
        $attrs.class as string,
      )
    "
  />
</template>
