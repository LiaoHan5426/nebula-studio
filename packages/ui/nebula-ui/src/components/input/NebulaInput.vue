<script setup lang="ts">
import { computed } from 'vue';
import { Input } from '../ui/input';
import { cn } from '../../utils/cn';
import { withTooltipAttrs } from '../../utils/tooltip';
import type { TooltipPlacement } from '../../utils/tooltip';
import type { NebulaFormControlProps } from '../form/types';

const props = withDefaults(
  defineProps<
    NebulaFormControlProps & {
      modelValue?: string | number;
      type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
      placeholder?: string;
      disabled?: boolean;
      readonly?: boolean;
      autocomplete?: string;
      class?: string;
      tooltip?: string;
      tooltipPlacement?: TooltipPlacement;
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
  'update:modelValue': [value: string];
  input: [event: Event];
  change: [event: Event];
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
