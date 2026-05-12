<script setup lang="ts">
import { ref } from 'vue';
import { NebulaReader } from '@nebula-studio/nebula-ui';
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
import readerPlainDemoCode from './reader-plain-demo.code.md?raw';

const snippet = ref(`export function add(a: number, b: number): number {
  return a + b;
}
`);

const code = readerPlainDemoCode;
</script>

<template>
  <section id="reader-plain">
    <DocsDemoSection
      title="NebulaReader · plain + 语法高亮"
      description='整篇代码预览时使用 format="plain"；plain-highlight-language 与所选语法一致（通常与 NebulaEditor 的 code-language 同步）。'
      :code="code"
      code-plain
    >
      <div class="reader-demo-surface">
        <NebulaReader
          :source="snippet"
          format="plain"
          plain-highlight-language="typescript"
        />
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
  max-height: min(72vh, 320px);
  overflow: auto;
}
</style>
