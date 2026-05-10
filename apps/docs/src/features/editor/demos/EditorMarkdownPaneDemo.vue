<script setup lang="ts">
import { ref } from 'vue';
import { NebulaMarkdownPane } from '@nebula-studio/nebula-ui';
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
import editorMarkdownPaneDemoCode from './editor-markdown-pane-demo.code.md?raw';

const md = ref(`# Nebula Markdown

与左侧编辑器 **同源** 字符串预览。

- 列表项
- \`inline code\`

\`\`\`typescript
export const greeting = 'Nebula';
\`\`\`
`);

const code = editorMarkdownPaneDemoCode;
</script>

<template>
  <section id="editor-markdown-pane">
    <DocsDemoSection
      title="NebulaMarkdownPane（Markdown 分栏）"
      description="同一 v-model：左侧 CodeMirror（codeLanguage=markdown，fence 内可嵌多语言），右侧 NebulaReader。"
      :code="code"
      code-plain
    >
      <div class="editor-markdown-pane-demo">
        <NebulaMarkdownPane
          v-model="md"
          mode="split"
          :editor-height="260"
          :preview-min-height="200"
        />
      </div>
    </DocsDemoSection>
  </section>
</template>

<style scoped>
.editor-markdown-pane-demo {
  width: 100%;
  min-width: 0;
}
</style>
