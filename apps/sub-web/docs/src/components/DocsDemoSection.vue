<script setup lang="ts">
import { ref, watch } from 'vue';
import { NebulaReader } from '@nebula-studio/nebula-ui';
import type { NebulaEditorCodeLanguage } from '@nebula-studio/nebula-ui';

const props = withDefaults(
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
    /** 根节点 `id`，供 `NebulaAnchor` 等页内锚点跳转 */
    sectionId?: string;
  }>(),
  {
    codePlain: false,
    codeHighlightLanguage: 'vue',
  },
);

/** 与 `<details :open>` 同步；示例代码仅在展开后挂载，避免 web 嵌入首帧无高亮（隐藏 subtree 内 innerHTML/hljs） */
const detailsOpen = ref(props.codeOpen === true);

watch(
  () => props.codeOpen,
  (v) => {
    detailsOpen.value = v === true;
  },
);

function onDetailsToggle(ev: Event): void {
  const el = ev.target as HTMLDetailsElement | null;
  if (!el) return;
  detailsOpen.value = el.open;
}
</script>

<template>
  <section class="demo-section" :id="sectionId || undefined">
    <header class="demo-section__head">
      <h3>{{ title }}</h3>
      <p v-if="description">{{ description }}</p>
    </header>
    <div class="demo-section__body">
      <slot />
    </div>
    <details
      v-if="code"
      class="demo-section__code"
      :open="detailsOpen"
      @toggle="onDetailsToggle"
    >
      <summary>示例代码</summary>
      <div class="demo-section__code-panel">
        <NebulaReader
          v-if="detailsOpen"
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

<style lang="scss" scoped>
.demo-section {
  overflow: hidden;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
}

.demo-section__head {
  padding: 0.95rem 1rem;
  background: hsl(var(--accent) / 24%);
  border-bottom: 1px solid hsl(var(--border));
}

.demo-section__head h3 {
  margin: 0;
  font-size: 1rem;
  line-height: 1.3;
}

.demo-section__head p {
  margin: 0.4rem 0 0;
  font-size: 0.88rem;
  line-height: 1.45;
  color: hsl(var(--muted-foreground));
}

.demo-section__body {
  padding: 1rem;
}

.demo-section__code {
  background: hsl(var(--background) / 42%);
  border-top: 1px solid hsl(var(--border));
}

.demo-section__code summary {
  padding: 0.62rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  user-select: none;
}

.demo-section__code-panel {
  box-sizing: border-box;
  width: 100%;
  padding: 0;
  border-top: 1px solid hsl(var(--border));
}

.demo-section__code-panel :deep(.nebula-reader--plain),
.demo-section__code-panel :deep(.nebula-markdown) {
  width: 100%;
  max-width: none;
  padding: 0;
  margin: 0;
}

.demo-section__code-panel :deep(.nebula-markdown .code-block) {
  border-right: none;
  border-left: none;
  border-radius: 0;
}

.demo-section__code-panel :deep(.nebula-reader__plain) {
  border-right: none;
  border-left: none;
  border-radius: 0;
}

/* 围栏外的补充说明（如引用）略留边距，避免贴边难读 */
.demo-section__code-panel :deep(.nebula-markdown blockquote),
.demo-section__code-panel :deep(.nebula-markdown > p) {
  margin-right: 0.85rem;
  margin-left: 0.85rem;
}
</style>
