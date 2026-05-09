<script setup lang="ts">
import { computed } from 'vue';
import { Marked } from 'marked';

const props = defineProps<{
  title: string;
  description?: string;
  code?: string;
  codeOpen?: boolean;
}>();

/** v-html 中代码块必须转义，否则 <template> 等会被当成真实标签解析 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const markdown = new Marked();
markdown.use({
  renderer: {
    code(token) {
      const language =
        (token.lang?.trim() || 'text').replace(/[^a-z0-9+-]/gi, '') || 'text';
      const rawCode = token.text ?? '';
      const safeLangLabel = escapeHtml(token.lang?.trim() || 'text');
      const encoded = encodeURIComponent(rawCode);
      const key = `${language}:${rawCode.length}:${rawCode.slice(0, 20)}`;
      const escapedCode = escapeHtml(rawCode);
      return `<div class="code-block"><div class="code-block__toolbar"><span class="code-block__lang">${safeLangLabel}</span><button type="button" class="code-block__copy" data-copy="${encoded}" data-key="${escapeHtml(key)}">Copy</button></div><pre><code class="language-${language}">${escapedCode}</code></pre></div>`;
    },
  },
});

const renderedCode = computed(() => {
  if (!props.code) return '';
  return markdown.parse(props.code) as string;
});

const onCodeAreaClick = async (event: MouseEvent) => {
  const target = event.target as HTMLElement | null;
  const button = target?.closest(
    '.code-block__copy',
  ) as HTMLButtonElement | null;
  if (!button) return;

  const encoded = button.dataset.copy;
  const key = button.dataset.key;
  if (!encoded || !key) return;

  const text = decodeURIComponent(encoded);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
  button.textContent = 'Copied';
  window.setTimeout(() => {
    if (button.dataset.key === key) button.textContent = 'Copy';
  }, 1200);
};
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
      <div
        class="demo-section__code-markdown"
        v-html="renderedCode"
        @click="onCodeAreaClick"
      />
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

.demo-section__code-markdown {
  border-top: 1px solid hsl(var(--border));
  padding: 0.82rem 0.9rem;
}

.demo-section__code-markdown :deep(p) {
  margin: 0.4rem 0;
  color: hsl(var(--muted-foreground));
  font-size: 0.86rem;
}

.demo-section__code-markdown :deep(pre) {
  margin: 0;
  padding: 0.85rem;
  overflow-x: auto;
  background: hsl(var(--background) / 55%);
}

.demo-section__code-markdown :deep(code) {
  font-size: 0.82rem;
  line-height: 1.58;
  color: hsl(var(--foreground));
  font-family:
    'Cascadia Code', 'JetBrains Mono', Consolas, 'Courier New', monospace;
}

.demo-section__code-markdown :deep(.code-block) {
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  overflow: hidden;
}

.demo-section__code-markdown :deep(.code-block__toolbar) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.55rem;
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--accent) / 20%);
}

.demo-section__code-markdown :deep(.code-block__lang) {
  color: hsl(var(--muted-foreground));
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.demo-section__code-markdown :deep(.code-block__copy) {
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--card));
  color: hsl(var(--foreground));
  font-size: 0.74rem;
  line-height: 1;
  padding: 0.3rem 0.42rem;
  cursor: pointer;
}
</style>
