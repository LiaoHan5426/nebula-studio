<script setup lang="ts">
import type { TooltipPlacement } from '../../utils/tooltip';
import type { NebulaFormControlProps } from '../form/types';

import { computed } from 'vue';

import { cn } from '../../utils/cn';
import { withTooltipAttrs } from '../../utils/tooltip';
import { Input } from '../ui/input';

const props = withDefaults(
  defineProps<
    NebulaFormControlProps & {
      autocomplete?: string;
      class?: string;
      disabled?: boolean;
      modelValue?: number | string;
      placeholder?: string;
      readonly?: boolean;
      tooltip?: string;
      tooltipPlacement?: TooltipPlacement;
      type?: 'email' | 'number' | 'password' | 'tel' | 'text' | 'url';
    }
  >(),
  {
    modelValue: '',
    type: 'text',
    placeholder: '',
    disabled: false,
    readonly: false,
    id: '',
    name: '',
    required: false,
    invalid: false,
    ariaDescribedby: '',
    ariaLabelledby: '',
    autocomplete: '',
    class: '',
    tooltip: '',
    tooltipPlacement: 'top',
  },
);

const emit = defineEmits<{
  change: [event: Event];
  input: [event: Event];
  'update:modelValue': [value: string];
}>();

const inputValue = computed({
  get: () => String(props.modelValue),
  set: (value) => emit('update:modelValue', value),
});
</script>

<template>
  <Input
    v-model="inputValue"
    :type="props.type"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :id="props.id || undefined"
    :name="props.name || undefined"
    :required="props.required"
    :aria-invalid="props.invalid || undefined"
    :aria-describedby="props.ariaDescribedby || undefined"
    :aria-labelledby="props.ariaLabelledby || undefined"
    :autocomplete="props.autocomplete || undefined"
    :data-invalid="props.invalid || undefined"
    :class="cn(props.class)"
    v-bind="withTooltipAttrs('', '', props.tooltip, props.tooltipPlacement)"
    @input="$emit('input', $event)"
    @change="$emit('change', $event)"
  />
</template>
