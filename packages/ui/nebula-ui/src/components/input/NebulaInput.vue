<script setup lang="ts">
import { computed } from 'vue';
import { Input } from '../ui/input';
import { cn } from '../../utils/cn';
import { withTooltipAttrs } from '../../utils/tooltip';
import type { TooltipPlacement } from '../../utils/tooltip';

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    class?: string;
    tooltip?: string;
    tooltipPlacement?: TooltipPlacement;
  }>(),
  {
    modelValue: '',
    type: 'text',
    placeholder: '',
    disabled: false,
    readonly: false,
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
    :class="cn(props.class)"
    v-bind="withTooltipAttrs('', '', props.tooltip, props.tooltipPlacement)"
    @input="$emit('input', $event)"
    @change="$emit('change', $event)"
  />
</template>
