<script setup lang="ts">
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '../../utils/cn';
import { withTooltipAttrs } from '../../utils/tooltip';
import type { TooltipPlacement } from '../../utils/tooltip';
import type { NebulaRadioOption } from './types';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    options?: NebulaRadioOption[];
    disabled?: boolean;
    class?: string;
    tooltip?: string;
    tooltipPlacement?: TooltipPlacement;
  }>(),
  {
    modelValue: '',
    options: () => [],
    disabled: false,
    class: '',
    tooltip: '',
    tooltipPlacement: 'top',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <RadioGroup
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event as string)"
    :disabled="disabled"
    :class="cn('flex flex-col gap-2', props.class)"
    v-bind="withTooltipAttrs('', '', props.tooltip, props.tooltipPlacement)"
  >
    <label
      v-for="option in options"
      :key="option.value"
      :class="
        cn(
          'flex items-center gap-2 cursor-pointer',
          option.disabled && 'cursor-not-allowed opacity-50',
        )
      "
    >
      <RadioGroupItem :value="option.value" :disabled="option.disabled" />
      <span class="text-sm font-medium">{{ option.label }}</span>
    </label>
  </RadioGroup>
</template>
