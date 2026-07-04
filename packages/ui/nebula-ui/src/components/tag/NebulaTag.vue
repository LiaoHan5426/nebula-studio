<script setup lang="ts">
import { computed } from 'vue';
import { Badge, badgeVariants } from '../ui/badge';
import type { BadgeVariants } from '../ui/badge';
import { cn } from '../../utils/cn';
import { withTooltipAttrs } from '../../utils/tooltip';
import type { TooltipPlacement } from '../../utils/tooltip';

type NebulaVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const props = withDefaults(
  defineProps<{
    variant?: NebulaVariant;
    class?: string;
    tooltip?: string;
    tooltipPlacement?: TooltipPlacement;
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
    <slot />
  </Badge>
</template>
