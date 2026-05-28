<script setup lang="ts">
import { ref } from 'vue';
import { NebulaEditor } from '@nebula-studio/nebula-ui';

const MIXED_DEMO_EDITOR_HEIGHT_PX = 780;

const md = ref(`# 混排示例

同一份 Markdown 里可以放多段代码，fence 上标注语言即可。

\`\`\`typescript
type Id = string;
export const ok = (x: Id) => x.length > 0;
\`\`\`

\`\`\`java
public final class Hello {
  public static void main(String[] args) {
    System.out.println("Nebula");
  }
}
\`\`\`

\`\`\`python
def greet(name: str) -> str:
    return f"hello, {name}"
\`\`\`
`);
</script>

<template>
  <NebulaEditor
    v-model="md"
    variant="code"
    code-language="markdown"
    :show-code-language-switch="false"
    embed-preview
    :height="MIXED_DEMO_EDITOR_HEIGHT_PX"
  />
</template>
