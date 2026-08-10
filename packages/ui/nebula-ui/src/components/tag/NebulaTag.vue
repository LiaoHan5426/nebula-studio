<script setup lang="ts">
import type { TooltipPlacement } from '../../utils/tooltip';
import type { BadgeVariants } from '../ui/badge';

import { computed } from 'vue';

import { cn } from '../../utils/cn';
import { withTooltipAttrs } from '../../utils/tooltip';
import { Badge, badgeVariants } from '../ui/badge';

type NebulaVariant = 'danger' | 'default' | 'info' | 'success' | 'warning';

const props = withDefaults(
  defineProps<{
    class?: string;
    tooltip?: string;
    tooltipPlacement?: TooltipPlacement;
    variant?: NebulaVariant;
  }>(),
  {
    variant: 'default',
    class: '',
    tooltip: '',
    tooltipPlacement: 'top',
  },
);

const shadcnVariant = computed((): BadgeVariants['variant'] => {
  const map: Record<NebulaVariant, BadgeVariants['variant']> = {
    default: 'default',
    success: 'success',
    warning: 'warning',
    danger: 'destructive',
    info: 'outline',
  };
  return map[props.variant];
});
</script>

<template>
  <Badge
    :variant="shadcnVariant"
    :class="cn(badgeVariants({ variant: shadcnVariant }), props.class)"
    v-bind="withTooltipAttrs('', '', props.tooltip, props.tooltipPlacement)"
  >
    <slot></slot>
  </Badge>
</template>
