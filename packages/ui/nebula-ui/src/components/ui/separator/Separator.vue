<script setup lang="ts">
import type { SeparatorProps } from 'reka-ui';

import type { HTMLAttributes } from 'vue';

import { Separator } from 'reka-ui';

import { cn } from '../../../utils/cn';

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
