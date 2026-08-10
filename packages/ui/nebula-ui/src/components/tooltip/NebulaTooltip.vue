<script setup lang="ts">
import type { TooltipContentProps } from 'reka-ui';

import { Tooltip } from '../ui/tooltip';

type TooltipPlacement = TooltipContentProps['side'];

const props = defineProps<{
  class?: string;
  content: string;
  placement?: TooltipPlacement;
}>();
</script>

<template>
  <Tooltip
    :content="props.content"
    :side="props.placement || 'top'"
    :class="props.class"
  >
    <slot></slot>
  </Tooltip>
</template>
