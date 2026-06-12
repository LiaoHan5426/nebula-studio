<script setup lang="ts">
import { ref } from 'vue';
import type {
  EditorError,
  EditorLifecycleHooks,
  EditorOptions,
} from 'monaco-editor-vue3';
import { CodeEditor } from 'monaco-editor-vue3';

withDefaults(
  defineProps<{
    language?: string;
  }>(),
  {
    language: 'javascript',
  },
);

const code = ref<string>('console.log(Hello Word)');

const editorError = ref<EditorError | null>(null);
const options: EditorOptions = {
  fontSize: 14,
  minimap: { enabled: false },
};
const lifecycleHooks: EditorLifecycleHooks = {
  beforeCreate: async () => {},
  onCreated: () => {},
  onReady: () => {},
  onError: (error) => {
    console.error('Lifecycle error:', error);
  },
};
const handleError = (error: EditorError | null) => {
  editorError.value = error;
  if (error) {
    console.error('Editor error:', error);
  }
};
const handleReady = () => {};

const handleLoading = (_loadingState: unknown) => {};
</script>

<template>
  <div style="height: 100%">
    <CodeEditor
      v-model:value="code"
      :language="language"
      :options="options"
      :lifecycle="lifecycleHooks"
      @error="handleError"
      @ready="handleReady"
      @loading="handleLoading"
    >
      <template #loading="{ progress }">
        <div>loading... {{ progress }}%</div>
      </template>
      <template #error="{ error, retry }">
        <div>Error:{{ error.message }}</div>
        <button @click="retry">retry</button>
      </template>
    </CodeEditor>
  </div>
</template>
