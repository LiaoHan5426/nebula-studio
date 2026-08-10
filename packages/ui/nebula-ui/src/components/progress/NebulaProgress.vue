<script setup lang="ts">
import type { TooltipPlacement } from '../../utils/tooltip';

import { cn } from '../../utils/cn';
import { withTooltipAttrs } from '../../utils/tooltip';
import { Progress } from '../ui/progress';

const props = withDefaults(
  defineProps<{
    class?: string;
    max?: number;
    modelValue?: number;
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
