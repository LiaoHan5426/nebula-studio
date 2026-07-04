<script setup lang="ts">
import { Progress } from '../ui/progress';
import { cn } from '../../utils/cn';
import { withTooltipAttrs } from '../../utils/tooltip';
import type { TooltipPlacement } from '../../utils/tooltip';

const props = withDefaults(
  defineProps<{
    modelValue?: number;
    max?: number;
    class?: string;
    tooltip?: string;
    tooltipPlacement?: TooltipPlacement;
  }>(),
  {
    modelValue: 0,
    max: 100,
    class: '',
    tooltip: '',
    tooltipPlacement: 'top',
  },
);
</script>

<template>
  <div
    :class="cn('w-full', props.class)"
    v-bind="withTooltipAttrs('', '', props.tooltip, props.tooltipPlacement)"
  >
    <Progress :model-value="modelValue" :max="max" />
  </div>
</template>
