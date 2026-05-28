<template>
  <div class="monaco-template">
    <label class="language-field">
      <span>Language</span>
      <NebulaSelect v-model="language" :options="languageOptions" />
    </label>

    <CodeEditor
      v-model:value="code"
      :language="language"
      theme="vs-dark"
      :height="600"
      :options="editorOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CodeEditor from '../integration/monaco-editor.vue';
import { NebulaSelect } from '@nebula-studio/nebula-ui';

const languageOptions = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JSON', value: 'json' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'SCSS', value: 'scss' },
  { label: 'Less', value: 'less' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'YAML', value: 'yaml' },
  { label: 'XML', value: 'xml' },
  { label: 'SQL', value: 'sql' },
] as const;

const language = ref<string>('javascript');
const code = ref(`function hello() {
console.log('Hello, Monaco Editor!');
}`);

const editorOptions = {
  fontSize: 14,
  minimap: { enabled: false },
  automaticLayout: true,
};
</script>

<style scoped>
.monaco-template {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 800px;
  height: 680px;
}

.language-field {
  display: flex;
  flex-direction: row;
  gap: 6px;
  align-items: center;
  width: 220px;
  font-size: 13px;
  color: var(--foreground);
}

.language-field select {
  height: 32px;
  padding: 0 8px;
  color: var(--foreground);
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 6px;
}
</style>
