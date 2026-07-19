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
        'nebula-input-control flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  />
</template>

<style scoped>
.nebula-input-control {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  height: 38px;
  padding: 7px 11px;
  font: inherit;
  font-size: 13px;
  color: hsl(var(--foreground));
  outline: none;
  background: hsl(var(--input-background));
  border: 1px solid hsl(var(--input));
  border-radius: var(--radius-md, 8px);
  box-shadow: 0 1px 2px hsl(var(--foreground) / 4%);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.nebula-input-control:focus-visible {
  border-color: hsl(var(--primary) / 72%);
  box-shadow: 0 0 0 3px hsl(var(--ring) / 16%);
}

.nebula-input-control[data-invalid='true'],
.nebula-input-control[aria-invalid='true'] {
  border-color: hsl(var(--destructive));
  box-shadow: 0 0 0 3px hsl(var(--destructive) / 12%);
}

.nebula-input-control:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.nebula-input-control::placeholder {
  color: hsl(var(--muted-foreground));
}
</style>
