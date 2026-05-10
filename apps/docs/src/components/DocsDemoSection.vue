<script setup lang="ts">
import { NebulaReader } from '@nebula-studio/nebula-ui';
import type { NebulaEditorCodeLanguage } from '@nebula-studio/nebula-ui';

withDefaults(
  defineProps<{
    title: string;
    description?: string;
    /** 示例源码字符串 */
    code?: string;
    codeOpen?: boolean;
    /**
     * true：按纯文本 + 语法高亮渲染，不把 `code` 当 Markdown 解析。
     * 用于 Vue SFC 等内含 ``` 围栏的源码，避免嵌套围栏破坏外层代码块与多余滚动条。
     */
    codePlain?: boolean;
    /** `code-plain` 时的语法高亮语言（默认 vue，含 template + script） */
    codeHighlightLanguage?: NebulaEditorCodeLanguage;
  }>(),
  {
    codePlain: false,
    codeHighlightLanguage: 'vue',
  },
);
</script>

<template>
  <section class="demo-section">
    <header class="demo-section__head">
      <h3>{{ title }}</h3>
      <p v-if="description">{{ description }}</p>
    </header>
    <div class="demo-section__body">
      <slot />
    </div>
    <details v-if="code" class="demo-section__code" :open="codeOpen">
      <summary>示例代码</summary>
      <div class="demo-section__code-panel">
        <NebulaReader
          :source="code ?? ''"
          :format="codePlain ? 'plain' : 'markdown'"
          :plain-highlight-language="
            codePlain ? codeHighlightLanguage : undefined
          "
        />
      </div>
    </details>
  </section>
</template>

<style scoped>
.demo-section {
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  background: hsl(var(--card));
  overflow: hidden;
}

.demo-section__head {
  padding: 0.95rem 1rem;
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--accent) / 24%);
}

.demo-section__head h3 {
  margin: 0;
  font-size: 1rem;
  line-height: 1.3;
}

.demo-section__head p {
  margin: 0.4rem 0 0;
  color: hsl(var(--muted-foreground));
  font-size: 0.88rem;
  line-height: 1.45;
}

.demo-section__body {
  padding: 1rem;
}

.demo-section__code {
  border-top: 1px solid hsl(var(--border));
  background: hsl(var(--background) / 42%);
}

.demo-section__code summary {
  cursor: pointer;
  user-select: none;
  padding: 0.62rem 0.85rem;
  color: hsl(var(--muted-foreground));
  font-size: 0.82rem;
  font-weight: 600;
}

.demo-section__code-panel {
  box-sizing: border-box;
  width: 100%;
  border-top: 1px solid hsl(var(--border));
  padding: 0;
}

.demo-section__code-panel :deep(.nebula-reader--plain),
.demo-section__code-panel :deep(.nebula-markdown) {
  margin: 0;
  padding: 0;
  width: 100%;
  max-width: none;
}

.demo-section__code-panel :deep(.nebula-markdown .code-block) {
  border-radius: 0;
  border-left: none;
  border-right: none;
}

.demo-section__code-panel :deep(.nebula-reader__plain) {
  border-radius: 0;
  border-left: none;
  border-right: none;
}

/* 围栏外的补充说明（如引用）略留边距，避免贴边难读 */
.demo-section__code-panel :deep(.nebula-markdown blockquote),
.demo-section__code-panel :deep(.nebula-markdown > p) {
  margin-left: 0.85rem;
  margin-right: 0.85rem;
}
</style>
