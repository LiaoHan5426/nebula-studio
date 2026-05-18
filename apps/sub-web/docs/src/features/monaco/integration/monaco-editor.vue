<script setup lang="ts">
import { ref } from 'vue';
import type {
  EditorError,
  EditorLifecycleHooks,
  EditorOptions,
} from 'monaco-editor-vue3';
import { CodeEditor } from 'monaco-editor-vue3';
const language = ref<string>('json')
const code = ref<string>('console.log(Hello Word)');

const editorError = ref<EditorError | null>(null);
const options: EditorOptions = {
  fontSize: 14,
  minimap: { enabled: false },
};
// Lifecycle hooks
const lifecycleHooks: EditorLifecycleHooks = {
  beforeCreate: async () => {
    console.log('Editor will be created...');
  },
  onCreated: (editor) => {
    console.log('Editor created:', editor);
  },
  onReady: (editor) => {
    console.log('Editor is ready:', editor);
  },
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
const handleReady = () => {
  console.log('Editor is ready for use');
};

const handleLoading = (loadingState: any) => {
  console.log('Loading state:', loadingState);
};
</script>

<template>
  <div style="height: 100%">
    <CodeEditor
      v-model:value="code"
      :language="language"
      :lifecycle="lifecycleHooks"
      @error="handleError"
      @ready="handleReady"
      @loading="handleLoading"
    >
      <template #loading="{ loading, progress }">
        <div>loading... {{ progress }}%</div>
      </template>
      <template #error="{ error, retry }">
        <div>Error:{{ error.message }}</div>
        <button @click="retry">retry</button>
      </template>
    </CodeEditor>
  </div>
</template>
