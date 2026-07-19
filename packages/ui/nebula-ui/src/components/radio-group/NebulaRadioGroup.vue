<script setup lang="ts">
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '../../utils/cn';
import { withTooltipAttrs } from '../../utils/tooltip';
import type { TooltipPlacement } from '../../utils/tooltip';
import type { NebulaRadioOption } from './types';
import type { NebulaFormControlProps } from '../form/types';

const props = withDefaults(
  defineProps<
    NebulaFormControlProps & {
      modelValue?: string;
      options?: NebulaRadioOption[];
      disabled?: boolean;
      class?: string;
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
  'update:modelValue': [value: string];
  change: [value: string];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
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
          'flex items-center gap-2 cursor-pointer',
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
