<script setup lang="ts">
import type {
  GenericObject,
  InvalidSubmissionContext,
  TypedSchema,
} from 'vee-validate';

import { Form } from 'vee-validate';

import { cn } from '../../utils/cn';

const props = withDefaults(
  defineProps<{
    class?: string;
    initialValues?: GenericObject;
    keepValues?: boolean;
    name?: string;
    validateOnMount?: boolean;
    validationSchema?: Record<string, unknown> | TypedSchema;
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
  invalidSubmit: [context: InvalidSubmissionContext];
  reset: [];
  submit: [values: GenericObject];
}>();
</script>

<template>
  <Form
    v-slot="form"
    as="form"
    :class="cn('nebula-form', props.class)"
    :initial-values="initialValues"
    :keep-values="keepValues"
    :name="name"
    :validate-on-mount="validateOnMount"
    :validation-schema="validationSchema"
    novalidate
    @invalid-submit="emit('invalidSubmit', $event)"
    @reset="emit('reset')"
    @submit="emit('submit', $event)"
  >
    <slot v-bind="form"></slot>
  </Form>
</template>

<style scoped>
.nebula-form {
  display: grid;
  gap: 18px;
  width: 100%;
}
</style>
