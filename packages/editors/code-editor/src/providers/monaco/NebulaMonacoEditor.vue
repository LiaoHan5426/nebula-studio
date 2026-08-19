<script setup lang="ts">
import type {
  CodeEditorError,
  CodeEditorOptions,
  CodeEditorReadyPayload,
} from '../../types';

import { computed, ref } from 'vue';

import { CodeEditor } from 'monaco-editor-vue3';

import { normalizeCodeEditorOptions } from '../../options';

const props = withDefaults(
  defineProps<{
    language?: string;
    modelValue?: string;
    options?: CodeEditorOptions;
    readonly?: boolean;
    theme?: 'dark' | 'light';
  }>(),
  {
    modelValue: '',
    language: 'plaintext',
    readonly: false,
    theme: 'light',
    options: () => ({}),
  },
);

const emit = defineEmits<{
  error: [error: CodeEditorError];
  ready: [payload: CodeEditorReadyPayload];
  'update:modelValue': [value: string];
}>();

const failed = ref<CodeEditorError>();
const value = computed({
  get: () => props.modelValue,
  set: (next: string) => emit('update:modelValue', next),
});
const providerOptions = computed(() => {
  const options = normalizeCodeEditorOptions(props.options);
  return {
    fontSize: options.fontSize,
    tabSize: options.tabSize,
    minimap: { enabled: options.minimap },
    lineNumbers: options.lineNumbers ? 'on' : 'off',
    wordWrap: options.wordWrap,
    automaticLayout: options.automaticLayout,
    readOnly: props.readonly,
  };
});

function handleReady(editor: unknown): void {
  failed.value = undefined;
  emit('ready', { editor, provider: 'monaco' });
}

function handleError(cause: unknown): void {
  const error: CodeEditorError = {
    message: cause instanceof Error ? cause.message : '代码编辑器加载失败',
    cause,
    provider: 'monaco',
  };
  failed.value = error;
  emit('error', error);
}
</script>

<template>
  <div class="monaco-provider">
    <CodeEditor
      v-model:value="value"
      :language="language"
      :theme="theme === 'dark' ? 'vs-dark' : 'vs'"
      :options="providerOptions"
      @ready="handleReady"
      @error="handleError"
    >
      <template #loading="{ progress }">
        <div class="monaco-provider__state" role="status">
          正在加载 Monaco… {{ progress }}%
        </div>
      </template>
      <template #error="{ error, retry }">
        <div class="monaco-provider__state" role="alert">
          <span>{{ error?.message ?? failed?.message }}</span>
          <button type="button" @click="retry">重新加载</button>
        </div>
      </template>
    </CodeEditor>
  </div>
</template>

<style scoped>
.monaco-provider {
  height: 100%;
}

.monaco-provider__state {
  display: grid;
  gap: 8px;
  place-items: center;
  height: 100%;
  color: hsl(var(--muted-foreground));
}

.monaco-provider__state button {
  padding: 6px 10px;
  color: hsl(var(--foreground));
  cursor: pointer;
  background: hsl(var(--muted));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-sm);
}
</style>
