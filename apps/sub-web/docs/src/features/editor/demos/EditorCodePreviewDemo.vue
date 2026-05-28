<script setup lang="ts">
import { ref } from 'vue';
import type { NebulaEditorCodeLanguage } from '@nebula-studio/nebula-ui';
import { NebulaEditor } from '@nebula-studio/nebula-ui';
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
import editorCodePreviewDemoCode from './editor-code-preview-demo.code.md?raw';

const codeLang = ref<NebulaEditorCodeLanguage>('typescript');

const ts = ref(`interface Row {
  id: string;
  label: string;
}

export function pick<T>(xs: T[]): T | undefined {
  return xs[0];
}
`);

const code = editorCodePreviewDemoCode;
</script>

<template>
  <section id="editor-code-preview">
    <DocsDemoSection
      title="NebulaEditor（代码 · 整篇单语法） + 内嵌 NebulaReader"
      description="工具栏内置语法下拉与「预览」开关；embed-preview 将 NebulaReader 收入同一组件，预览区高度与编辑区一致。"
      :code="code"
      code-plain
    >
      <NebulaEditor
        v-model="ts"
        v-model:code-language="codeLang"
        variant="code"
        show-code-language-switch
        embed-preview
        :height="240"
      />
    </DocsDemoSection>
  </section>
</template>
