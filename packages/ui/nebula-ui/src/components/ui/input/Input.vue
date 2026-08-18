<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

import { computed } from 'vue';

import { cn } from '../../../utils/cn';

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class'];
    disabled?: boolean;
    modelValue?: number | string;
    placeholder?: string;
    readonly?: boolean;
    type?: 'email' | 'number' | 'password' | 'tel' | 'text' | 'url';
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
        'nebula-input-control flex h-9 min-h-9 w-full min-w-0 rounded-md border border-input bg-input-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-[invalid=true]:border-destructive data-[invalid=true]:ring-2 data-[invalid=true]:ring-destructive/20',
        props.class,
      )
    "
  />
</template>
