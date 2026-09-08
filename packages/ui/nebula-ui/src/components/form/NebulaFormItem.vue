<script setup lang="ts">
import type { Component } from 'vue';

import type { NebulaFormRule } from './types';

import { computed, inject, useId } from 'vue';

import { cn } from '../../utils/cn';
import { firstFormError, nebulaFormContextKey } from './types';

const props = withDefaults(
  defineProps<{
    class?: string;
    hint?: string;
    id?: string;
    label?: string;
    name: string;
    required?: boolean;
    rules?: NebulaFormRule;
    validateOnBlur?: boolean;
    validateOnChange?: boolean;
    validateOnInput?: boolean;
    validateOnModelUpdate?: boolean;
  }>(),
  {
    label: '',
    id: '',
    rules: undefined,
    required: false,
    hint: '',
    validateOnBlur: true,
    validateOnChange: true,
    validateOnInput: false,
    validateOnModelUpdate: true,
    class: '',
  },
);

const form = inject(nebulaFormContextKey);
if (!form) {
  throw new Error('NebulaFormItem must be used inside NebulaForm.');
}

const FormField = form.Field as Component;

const generatedId = useId();
const controlId = computed(() => props.id || `nebula-field-${generatedId}`);
const hintId = computed(() => `${controlId.value}-hint`);
const errorId = computed(() => `${controlId.value}-error`);

const fieldValidators = computed(() => {
  const rule = props.rules;
  if (!rule) {
    return undefined;
  }

  const run = ({ value }: { value: unknown }) => {
    const result = rule(value);
    if (result === true || result === undefined) {
      return undefined;
    }
    return result;
  };

  return {
    onBlur: props.validateOnBlur ? run : undefined,
    onChange:
      props.validateOnChange ||
      props.validateOnInput ||
      props.validateOnModelUpdate
        ? run
        : undefined,
    onSubmit: run,
  };
});

function errorMessageOf(field: {
  state: {
    meta: { errors: unknown[]; isBlurred?: boolean; isTouched?: boolean };
  };
}): string {
  const message = firstFormError(field.state.meta.errors);
  if (!message) {
    return '';
  }
  const attempts = Number(
    (form as { state?: { submissionAttempts?: number } }).state
      ?.submissionAttempts ?? 0,
  );
  if (
    attempts > 0 ||
    field.state.meta.isBlurred ||
    field.state.meta.isTouched
  ) {
    return message;
  }
  return '';
}

function createControlProps(
  field: {
    handleBlur: () => void;
    handleChange: (value: unknown) => void;
    state: { value: unknown };
  },
  invalid: boolean,
  describedBy?: string,
): Record<string, unknown> {
  return {
    modelValue: field.state.value,
    'onUpdate:modelValue': (value: unknown) => field.handleChange(value),
    onBlur: () => field.handleBlur(),
    id: controlId.value,
    name: props.name,
    required: props.required,
    invalid,
    ariaDescribedby: describedBy,
  };
}
</script>

<template>
  <FormField
    :name="name as never"
    :validators="fieldValidators"
    v-slot="{ field }"
  >
    <div
      :class="
        cn(
          'nebula-form-item',
          errorMessageOf(field) && 'is-invalid',
          props.class,
        )
      "
      :data-field-name="name"
    >
      <label v-if="label" class="nebula-form-item__label" :for="controlId">
        {{ label }}
        <span
          v-if="required"
          class="nebula-form-item__required"
          aria-hidden="true"
          >*</span
        >
      </label>

      <div class="nebula-form-item__control">
        <slot
          :control-props="
            createControlProps(
              field,
              Boolean(errorMessageOf(field)),
              errorMessageOf(field) ? errorId : hint ? hintId : undefined,
            )
          "
          :described-by="
            errorMessageOf(field) ? errorId : hint ? hintId : undefined
          "
          :error-message="errorMessageOf(field)"
          :field="
            createControlProps(
              field,
              Boolean(errorMessageOf(field)),
              errorMessageOf(field) ? errorId : hint ? hintId : undefined,
            )
          "
          :id="controlId"
          :invalid="Boolean(errorMessageOf(field))"
          :meta="field.state.meta"
          :value="field.state.value"
        ></slot>
      </div>

      <p
        v-if="errorMessageOf(field)"
        :id="errorId"
        class="nebula-form-item__error"
        role="alert"
      >
        {{ errorMessageOf(field) }}
      </p>
      <p v-else-if="hint" :id="hintId" class="nebula-form-item__hint">
        {{ hint }}
      </p>
    </div>
  </FormField>
</template>

<style scoped>
.nebula-form-item {
  display: grid;
  gap: 7px;
  min-width: 0;
}

.nebula-form-item__label {
  width: fit-content;
  font-size: 13px;
  font-weight: 650;
  line-height: 1.45;
  color: hsl(var(--foreground));
}

.nebula-form-item__required {
  margin-left: 3px;
  color: hsl(var(--destructive));
}

.nebula-form-item__control {
  min-width: 0;
}

.nebula-form-item__error,
.nebula-form-item__hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
}

.nebula-form-item__error {
  color: hsl(var(--destructive));
}

.nebula-form-item__hint {
  color: hsl(var(--muted-foreground));
}
</style>
