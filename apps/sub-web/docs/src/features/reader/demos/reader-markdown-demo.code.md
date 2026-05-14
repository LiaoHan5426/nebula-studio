<script setup lang="ts">
import { ref } from 'vue';
import { NebulaReader } from '@nebula-studio/nebula-ui';

const md = ref(`# NebulaReader（Markdown）

与 **NebulaEditor** 解耦：直接传入 \`source\` + \`format="markdown"\`。

\`\`\`typescript
export const x = 1;
\`\`\`
`);
</script>

<template>
  <NebulaReader :source="md" format="markdown" />
</template>
