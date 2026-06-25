<script setup lang="ts">
import { NebulaSelect } from '@nebula-studio/nebula-ui';
import { computed, ref, watch } from 'vue';

import type { PluginNodeSchema } from '../types/schema';

const props = withDefaults(
  defineProps<{
    schema: PluginNodeSchema;
    modelValue?: Record<string, unknown>;
    showTitle?: boolean;
  }>(),
  {
    showTitle: true,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>];
}>();

const form = ref<Record<string, unknown>>({});

watch(
  () => props.modelValue,
  (value) => {
    form.value = { ...value };
  },
  { immediate: true, deep: true },
);

const fields = computed(() => props.schema.fields ?? []);

function updateField(key: string, value: unknown) {
  form.value = { ...form.value, [key]: value };
  emit('update:modelValue', form.value);
}

function selectValue(fieldKey: string, defaultValue?: unknown): string {
  const value = form.value[fieldKey] ?? defaultValue ?? '';
  return value === undefined || value === null ? '' : String(value);
}
</script>

<template>
  <div class="plugin-node-form">
    <h4 v-if="showTitle && schema.label" class="plugin-node-form__title">
      {{ schema.label }}
    </h4>
    <label
      v-for="field in fields"
      :key="field.key"
      class="plugin-node-form__field"
    >
      <span class="plugin-node-form__label">
        {{ field.label }}<span v-if="field.required"> *</span>
      </span>
      <input
        v-if="field.type === 'text'"
        :value="String(form[field.key] ?? field.defaultValue ?? '')"
        type="text"
        class="plugin-node-form__control"
        @input="
          updateField(field.key, ($event.target as HTMLInputElement).value)
        "
      />
      <input
        v-else-if="field.type === 'number'"
        :value="Number(form[field.key] ?? field.defaultValue ?? 0)"
        type="number"
        class="plugin-node-form__control"
        @input="
          updateField(
            field.key,
            Number(($event.target as HTMLInputElement).value),
          )
        "
      />
      <input
        v-else-if="field.type === 'boolean'"
        :checked="Boolean(form[field.key] ?? field.defaultValue ?? false)"
        type="checkbox"
        class="plugin-node-form__checkbox"
        @change="
          updateField(field.key, ($event.target as HTMLInputElement).checked)
        "
      />
      <NebulaSelect
        v-else-if="field.type === 'select'"
        class="plugin-node-form__select"
        :model-value="selectValue(field.key, field.defaultValue)"
        :options="field.options ?? []"
        label-key="label"
        value-key="value"
        :placeholder="`请选择${field.label}`"
        @update:model-value="updateField(field.key, $event)"
      />
    </label>
  </div>
</template>

<style scoped>
.plugin-node-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plugin-node-form__title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.plugin-node-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}

.plugin-node-form__label {
  color: hsl(var(--muted-foreground));
}

.plugin-node-form__control {
  width: 100%;
  padding: 8px 10px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.plugin-node-form__control:focus {
  outline: none;
  border-color: hsl(var(--primary) / 70%);
  box-shadow: 0 0 0 2px hsl(var(--primary) / 18%);
}

.plugin-node-form__checkbox {
  width: 16px;
  height: 16px;
  accent-color: hsl(var(--primary));
}

.plugin-node-form__select {
  width: 100%;
}
</style>
