<script setup lang="ts">
import { ref } from 'vue';
import { NebulaMarkdownPane } from '@nebula-studio/nebula-ui';

const md = ref(`# Nebula Markdown

与左侧编辑器 **同源** 字符串预览。

- 列表项
- \`inline code\`

\`\`\`typescript
export const greeting = 'Nebula';
\`\`\`
`);
</script>

<template>
  <NebulaMarkdownPane
    v-model="md"
    mode="split"
    :editor-height="260"
    :preview-min-height="200"
  />
</template>
