<script setup lang="ts">
import { ref } from 'vue';
import { NebulaEditor } from '@nebula-studio/nebula-ui';
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
import editorMarkdownMixedDemoCode from './editor-markdown-mixed-demo.code.md?raw';

/** 与示例正文行数匹配；略高于裸行高估算，抵消边框/行号区带来的少量溢出 */
const MIXED_DEMO_EDITOR_HEIGHT_PX = 780;

/** 主语言为 markdown：正文内多个 fenced 块可写不同 lang，编辑器内嵌高亮 + Reader 预览一致 */
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

const code = editorMarkdownMixedDemoCode;
</script>

<template>
  <section id="editor-markdown-mixed">
    <DocsDemoSection
      title="一篇 Markdown，多段语法（fence）"
      description="主语言选 markdown：CodeMirror 会对 fence 内嵌套高亮；embed-preview 右侧为同源 NebulaReader（代码块同步语法高亮）。整篇单一 TS/Java 文件请改用上一示例。"
      :code="code"
      code-plain
    >
      <NebulaEditor
        v-model="md"
        variant="code"
        code-language="markdown"
        :show-code-language-switch="false"
        embed-preview
        :height="MIXED_DEMO_EDITOR_HEIGHT_PX"
      />
    </DocsDemoSection>
  </section>
</template>
