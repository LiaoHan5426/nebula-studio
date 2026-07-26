<script setup lang="ts">
import { reactive, watch } from 'vue';
import {
  NebulaInput,
  NebulaSelect,
  NebulaSwitch,
} from '@nebula-studio/nebula-ui';

import type { PluginSchemaField } from './types';

const props = defineProps<{
  fields: PluginSchemaField[];
  modelValue: Record<string, unknown>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>];
}>();

const form = reactive<Record<string, unknown>>({});

watch(
  () => [props.fields, props.modelValue] as const,
  ([fields, value]) => {
    for (const key of Object.keys(form)) delete form[key];
    for (const field of fields) {
      form[field.key] = value[field.key] ?? field.defaultValue ?? '';
    }
  },
  { immediate: true, deep: true },
);

function update(key: string, value: unknown): void {
  form[key] = value;
  emit('update:modelValue', { ...form });
}
</script>

<template>
  <div class="schema-form">
    <p v-if="fields.length === 0" class="schema-form__empty">
      此插件没有声明可配置字段。
    </p>
    <label v-for="field in fields" v-else :key="field.key">
      <span>
        {{ field.label }}
        <strong v-if="field.required" aria-label="必填">*</strong>
      </span>
      <NebulaSwitch
        v-if="field.type === 'boolean'"
        :model-value="Boolean(form[field.key])"
        @update:model-value="update(field.key, $event)"
      />
      <NebulaSelect
        v-else-if="field.type === 'select'"
        :model-value="form[field.key]"
        :options="field.options ?? []"
        @update:model-value="update(field.key, $event)"
      />
      <NebulaInput
        v-else
        :model-value="String(form[field.key] ?? '')"
        :type="
          field.type === 'password'
            ? 'password'
            : field.type === 'number'
              ? 'number'
              : 'text'
        "
        :required="field.required"
        @update:model-value="update(field.key, $event)"
      />
      <small v-if="field.description">{{ field.description }}</small>
    </label>
  </div>
</template>

<style scoped>
.schema-form {
  display: grid;
  gap: var(--space-4);
}

.schema-form label {
  display: grid;
  gap: var(--space-2);
  font-size: var(--font-size-caption);
  font-weight: 700;
}

.schema-form strong {
  color: hsl(var(--destructive));
}

.schema-form small,
.schema-form__empty {
  margin: 0;
  font-weight: 400;
  color: hsl(var(--muted-foreground));
}
</style>
