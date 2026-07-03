<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../utils/cn';

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    class?: string;
  }>(),
  {
    modelValue: '',
    type: 'text',
    placeholder: '',
    disabled: false,
    readonly: false,
    class: '',
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
  <input
    v-model="inputValue"
    :type="props.type"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :class="
      cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
    @input="$emit('input', $event)"
    @change="$emit('change', $event)"
  />
</template>
