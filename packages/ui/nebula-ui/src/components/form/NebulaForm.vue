<script setup lang="ts">
import { Form } from 'vee-validate';
import type {
  GenericObject,
  InvalidSubmissionContext,
  TypedSchema,
} from 'vee-validate';
import { cn } from '../../utils/cn';

const props = withDefaults(
  defineProps<{
    validationSchema?: TypedSchema | Record<string, unknown>;
    initialValues?: GenericObject;
    validateOnMount?: boolean;
    keepValues?: boolean;
    name?: string;
    class?: string;
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
  submit: [values: GenericObject];
  invalidSubmit: [context: InvalidSubmissionContext];
  reset: [];
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
    <slot v-bind="form" />
  </Form>
</template>

<style scoped>
.nebula-form {
  display: grid;
  gap: 18px;
  width: 100%;
}
</style>
