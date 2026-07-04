<script lang="ts" setup>
import { computed } from 'vue';
import { cn } from '../../../utils/cn';
import type { HTMLAttributes } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    class?: HTMLAttributes['class'];
  }>(),
  {
    modelValue: '',
    type: 'text',
    placeholder: '',
    disabled: false,
    readonly: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const value = computed({
  get: () => String(props.modelValue),
  set: (val) => emit('update:modelValue', val),
});
</script>

<template>
  <input
    v-model="value"
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
  />
</template>
