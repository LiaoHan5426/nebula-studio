<script setup lang="ts">
import { ref } from 'vue';
import { NebulaReader } from '@nebula-studio/nebula-ui';
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
import readerMarkdownDemoCode from './reader-markdown-demo.code.md?raw';

const md = ref(`# NebulaReader（Markdown）

与 **NebulaEditor** 解耦：直接传入 \`source\` + \`format="markdown"\`。

\`\`\`typescript
export const x = 1;
\`\`\`
`);

const code = readerMarkdownDemoCode;
</script>

<template>
  <section id="reader-markdown">
    <DocsDemoSection
      title="NebulaReader · Markdown"
      description="marked 渲染；fence 内代码语法高亮，与编辑器侧 Markdown fence 体验一致。"
      :code="code"
      code-plain
    >
      <div class="reader-demo-surface">
        <NebulaReader :source="md" format="markdown" />
      </div>
    </DocsDemoSection>
  </section>
</template>

<style lang="scss" scoped>
.reader-demo-surface {
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  background: hsl(var(--card));
  padding: 0.65rem 0.85rem;
  max-height: min(72vh, 480px);
  overflow: auto;
}
</style>
