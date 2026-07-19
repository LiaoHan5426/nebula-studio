<script setup lang="ts">
import { computed, useId } from 'vue';
import { Field } from 'vee-validate';
import type { RuleExpression } from 'vee-validate';
import { cn } from '../../utils/cn';

const props = withDefaults(
  defineProps<{
    name: string;
    label?: string;
    id?: string;
    rules?: RuleExpression<unknown>;
    required?: boolean;
    hint?: string;
    validateOnBlur?: boolean;
    validateOnChange?: boolean;
    validateOnInput?: boolean;
    validateOnModelUpdate?: boolean;
    class?: string;
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

const generatedId = useId();
const controlId = computed(() => props.id || `nebula-field-${generatedId}`);
const hintId = computed(() => `${controlId.value}-hint`);
const errorId = computed(() => `${controlId.value}-error`);

function createControlProps<T extends object>(
  field: T,
  invalid: boolean,
  describedBy?: string,
): Record<string, unknown> {
  // componentField 同时包含原生 input/change 监听器。它们绑定到复合控件时会把
  // DOM Event 或原生 checkbox 的 "on" 写回字段，因此复合控件只使用 v-model 与 blur。
  const modelField = { ...field } as Record<string, unknown>;
  delete modelField.onChange;
  delete modelField.onInput;
  return {
    ...modelField,
    id: controlId.value,
    name: props.name,
    required: props.required,
    invalid,
    ariaDescribedby: describedBy,
  };
}
</script>

<template>
  <Field
    v-slot="{ componentField, errorMessage, meta, value }"
    :label="label || name"
    :name="name"
    :rules="rules"
    :validate-on-blur="validateOnBlur"
    :validate-on-change="validateOnChange"
    :validate-on-input="validateOnInput"
    :validate-on-model-update="validateOnModelUpdate"
  >
    <div
      :class="cn('nebula-form-item', errorMessage && 'is-invalid', props.class)"
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
              componentField,
              Boolean(errorMessage),
              errorMessage ? errorId : hint ? hintId : undefined,
            )
          "
          :described-by="errorMessage ? errorId : hint ? hintId : undefined"
          :error-message="errorMessage"
          :field="componentField"
          :id="controlId"
          :invalid="Boolean(errorMessage)"
          :meta="meta"
          :value="value"
        />
      </div>

      <p
        v-if="errorMessage"
        :id="errorId"
        class="nebula-form-item__error"
        role="alert"
      >
        {{ errorMessage }}
      </p>
      <p v-else-if="hint" :id="hintId" class="nebula-form-item__hint">
        {{ hint }}
      </p>
    </div>
  </Field>
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
