<script setup lang="ts">
import { NebulaCodeEditor as CodeEditorImpl } from '@nebula-studio/code-editor';
import type { NebulaEditorCodeLanguage } from '../types';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    language?: NebulaEditorCodeLanguage;
    height?: number | string;
    placeholder?: string;
    readonly?: boolean;
  }>(),
  {
    language: 'typescript',
    height: 320,
    placeholder: '',
    readonly: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <CodeEditorImpl
    v-bind="props"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
