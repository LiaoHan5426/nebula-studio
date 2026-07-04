<script setup lang="ts">
import { Tooltip } from '../ui/tooltip';
import type { TooltipContentProps } from 'reka-ui';

type TooltipPlacement = TooltipContentProps['side'];

defineProps<{
  content: string;
  placement?: TooltipPlacement;
  class?: string;
}>();
</script>

<template>
  <Tooltip :content="content" :side="placement || 'top'" :class="class">
    <slot />
  </Tooltip>
</template>
