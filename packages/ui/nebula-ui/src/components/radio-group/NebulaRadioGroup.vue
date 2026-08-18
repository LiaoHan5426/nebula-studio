<script setup lang="ts">
import type { TooltipPlacement } from '../../utils/tooltip';
import type { NebulaFormControlProps } from '../form/types';
import type { NebulaRadioOption } from './types';

import { cn } from '../../utils/cn';
import { withTooltipAttrs } from '../../utils/tooltip';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const props = withDefaults(
  defineProps<
    NebulaFormControlProps & {
      class?: string;
      disabled?: boolean;
      modelValue?: string;
      options?: NebulaRadioOption[];
      tooltip?: string;
      tooltipPlacement?: TooltipPlacement;
    }
  >(),
  {
    modelValue: '',
    options: () => [],
    disabled: false,
    class: '',
    tooltip: '',
    tooltipPlacement: 'top',
    id: '',
    name: '',
    required: false,
    invalid: false,
    ariaDescribedby: '',
    ariaLabelledby: '',
  },
);

const emit = defineEmits<{
  blur: [event: FocusEvent];
  change: [value: string];
  focus: [event: FocusEvent];
  'update:modelValue': [value: string];
}>();

function updateValue(value: string): void {
  emit('update:modelValue', value);
  emit('change', value);
}
</script>

<template>
  <RadioGroup
    :model-value="modelValue"
    :id="props.id || undefined"
    :name="props.name || undefined"
    :required="props.required"
    :aria-invalid="props.invalid || undefined"
    :aria-describedby="props.ariaDescribedby || undefined"
    :aria-labelledby="props.ariaLabelledby || undefined"
    :data-invalid="props.invalid || undefined"
    @update:model-value="updateValue($event as string)"
    :disabled="disabled"
    :class="cn('flex flex-col gap-2', props.class)"
    v-bind="withTooltipAttrs('', '', props.tooltip, props.tooltipPlacement)"
    @focusin="emit('focus', $event)"
    @focusout="emit('blur', $event)"
  >
    <label
      v-for="option in options"
      :key="option.value"
      :class="
        cn(
          'nebula-control-label flex items-center gap-2 cursor-pointer',
          option.disabled && 'cursor-not-allowed opacity-50',
        )
      "
    >
      <RadioGroupItem
        :id="props.id ? `${props.id}-${option.value}` : undefined"
        :value="option.value"
        :disabled="option.disabled"
        :aria-invalid="props.invalid || undefined"
      />
      <span class="text-sm font-medium">{{ option.label }}</span>
    </label>
  </RadioGroup>
</template>

<style scoped>
[data-invalid='true'] :deep([role='radio']) {
  border-color: hsl(var(--destructive));
  box-shadow: 0 0 0 2px hsl(var(--destructive) / 16%);
}
</style>
