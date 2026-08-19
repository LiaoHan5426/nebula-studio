<script setup lang="ts">
import type {
  CodeEditorError,
  CodeEditorOptions,
  CodeEditorReadyPayload,
} from '../types';

import { defineAsyncComponent } from 'vue';

import { useCodeEditorHost } from '../composables/useCodeEditorHost';

const props = withDefaults(
  defineProps<{
    height?: string;
    language?: string;
    modelValue?: string;
    options?: CodeEditorOptions;
    readonly?: boolean;
  }>(),
  {
    modelValue: '',
    language: 'plaintext',
    readonly: false,
    height: '320px',
    options: () => ({}),
  },
);

defineEmits<{
  error: [error: CodeEditorError];
  ready: [payload: CodeEditorReadyPayload];
  'update:modelValue': [value: string];
}>();

const { resolvedHeight, resolvedReadonly, resolvedTheme } =
  useCodeEditorHost(props);

const MonacoProvider = defineAsyncComponent({
  loader: () => import('../providers/monaco/NebulaMonacoEditor.vue'),
  delay: 120,
  timeout: 30_000,
});
</script>

<template>
  <div class="nebula-code-editor" :style="{ height: resolvedHeight }">
    <Suspense>
      <MonacoProvider
        :model-value="modelValue"
        :language="language"
        :readonly="resolvedReadonly"
        :theme="resolvedTheme"
        :options="options"
        @update:model-value="$emit('update:modelValue', $event)"
        @ready="$emit('ready', $event)"
        @error="$emit('error', $event)"
      />
      <template #fallback>
        <div class="nebula-code-editor__state" role="status">
          正在加载代码编辑器…
        </div>
      </template>
    </Suspense>
  </div>
</template>

<style scoped>
.nebula-code-editor {
  min-height: 120px;
  overflow: hidden;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
}

.nebula-code-editor__state {
  display: grid;
  place-items: center;
  height: 100%;
  color: hsl(var(--muted-foreground));
}
</style>
