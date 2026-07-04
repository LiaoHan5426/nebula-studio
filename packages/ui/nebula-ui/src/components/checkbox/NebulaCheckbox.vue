<script setup lang="ts">
import { Checkbox } from '../ui/checkbox';
import { cn } from '../../utils/cn';
import { useBooleanModel } from '../../composables/useBooleanModel';
import { withTooltipAttrs } from '../../utils/tooltip';
import type { TooltipPlacement } from '../../utils/tooltip';

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    label?: string;
    disabled?: boolean;
    class?: string;
    tooltip?: string;
    tooltipPlacement?: TooltipPlacement;
  }>(),
  {
    modelValue: false,
    label: '',
    disabled: false,
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
    :class="
      cn(
        'inline-flex items-center gap-2 cursor-pointer',
        disabled && 'cursor-not-allowed opacity-50',
        props.class,
      )
    "
    v-bind="withTooltipAttrs('', '', props.tooltip, props.tooltipPlacement)"
  >
    <Checkbox v-model:checked="model" :disabled="disabled" />
    <span v-if="props.label" class="text-sm font-medium">
      {{ props.label }}
    </span>
    <slot />
  </label>
</template>
