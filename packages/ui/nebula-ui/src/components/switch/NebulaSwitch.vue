<script setup lang="ts">
import { Switch } from '../ui/switch';
import { cn } from '../../utils/cn';
import { useBooleanModel } from '../../composables/useBooleanModel';
import { withTooltipAttrs } from '../../utils/tooltip';
import type { TooltipPlacement } from '../../utils/tooltip';

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    label?: string;
    class?: string;
    tooltip?: string;
    tooltipPlacement?: TooltipPlacement;
  }>(),
  {
    modelValue: false,
    label: '',
    class: '',
    tooltip: '',
    tooltipPlacement: 'top',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const model = useBooleanModel(
  () => props.modelValue,
  (next) => emit('update:modelValue', next),
);
</script>

<template>
  <label
    :class="cn('inline-flex items-center gap-2', props.class)"
    v-bind="withTooltipAttrs('', '', props.tooltip, props.tooltipPlacement)"
  >
    <Switch v-model:checked="model" />
    <span v-if="props.label" class="text-sm font-medium">
      {{ props.label }}
    </span>
  </label>
</template>
