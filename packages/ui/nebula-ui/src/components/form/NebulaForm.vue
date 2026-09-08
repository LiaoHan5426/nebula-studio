<script setup lang="ts">
import type { NebulaFormSchema, NebulaFormValues } from './types';

import { computed, provide } from 'vue';

import { useForm } from '@tanstack/vue-form';

import { cn } from '../../utils/cn';
import { nebulaFormContextKey } from './types';

const props = withDefaults(
  defineProps<{
    class?: string;
    initialValues?: NebulaFormValues;
    keepValues?: boolean;
    name?: string;
    validateOnMount?: boolean;
    validationSchema?: NebulaFormSchema;
  }>(),
  {
    validationSchema: undefined,
    initialValues: () => ({}),
    validateOnMount: false,
    keepValues: false,
    name: 'NebulaForm',
    class: '',
  },
);

const emit = defineEmits<{
  invalidSubmit: [context: { errors: unknown; values: NebulaFormValues }];
  reset: [];
  submit: [values: NebulaFormValues];
}>();

const formValidators = computed(() => {
  const schema = props.validationSchema;
  if (!schema) {
    return undefined;
  }
  return {
    ...(props.validateOnMount ? { onMount: schema } : {}),
    onChange: schema,
    onSubmit: schema,
  };
});

const form = useForm({
  defaultValues: { ...props.initialValues },
  onSubmit: async ({ value }) => {
    emit('submit', value);
  },
  onSubmitInvalid: ({ formApi, value }) => {
    emit('invalidSubmit', {
      values: value,
      errors: formApi.state.errorMap,
    });
  },
  validators: formValidators.value as never,
});

provide(nebulaFormContextKey, form as never);

function handleSubmit(event: Event): void {
  event.preventDefault();
  event.stopPropagation();
  void form.handleSubmit();
}

function handleReset(event: Event): void {
  event.preventDefault();
  form.reset();
  emit('reset');
}
</script>

<template>
  <form
    :class="cn('nebula-form', props.class)"
    :name="name"
    novalidate
    @reset="handleReset"
    @submit="handleSubmit"
  >
    <slot
      :form="form"
      :keep-values="keepValues"
      :values="form.state.values"
    ></slot>
  </form>
</template>

<style scoped>
.nebula-form {
  display: grid;
  gap: 18px;
  width: 100%;
}
</style>
