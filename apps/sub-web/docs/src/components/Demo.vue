<script setup lang="ts">
import type { Component } from 'vue';

import { markRaw, onMounted, ref, shallowRef, watch } from 'vue';

import { getHighlighter } from '@/utils/highlighter';

function resolveVueComponent(input: unknown): Component | undefined {
  if (input === null || input === undefined) return undefined;
  if (typeof input === 'function') return input as Component;
  if (typeof input !== 'object') return undefined;

  const rec = input as Record<string, unknown>;
  if (rec.component && rec.component !== input) {
    const nested = resolveVueComponent(rec.component);
    if (nested) return nested;
  }
  if (rec.default && rec.default !== input) {
    const nested = resolveVueComponent(rec.default);
    if (nested) return nested;
  }
  if (rec.setup || rec.render || rec.template || rec.name || '__name' in rec) {
    return input as Component;
  }
  return undefined;
}

const props = withDefaults(
  defineProps<{
    component?: Component | Record<string, unknown>;
    id?: string;
    showSource?: boolean;
    source?: string;
  }>(),
  {
    source: '',
    showSource: true,
  },
);

const highlightedCode = ref('');
const demoComponent = shallowRef<Component | undefined>();

function syncDemoComponent(component: unknown) {
  const resolved = resolveVueComponent(component);
  demoComponent.value = resolved ? markRaw(resolved) : undefined;
}

syncDemoComponent(props.component);

watch(
  () => props.component,
  (component) => {
    syncDemoComponent(component);
  },
);

/**
 * 对源代码进行高亮处理。
 */
async function highlightSource() {
  if (!props.source) {
    return;
  }
  try {
    const h = await getHighlighter();
    highlightedCode.value = h.codeToHtml(props.source, {
      lang: 'vue',
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    });
  } catch (e) {
    console.error('Failed to highlight code:', e);
    // 降级：显示原始代码
    highlightedCode.value = `<pre><code>${escapeHtml(props.source)}</code></pre>`;
  }
}

/**
 * 转义 HTML 特殊字符。
 */
function escapeHtml(text: string | undefined): string {
  return (text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

onMounted(() => {
  highlightSource();
});
</script>

<template>
  <div :id="id" class="demo-container">
    <!-- 预览区域 -->
    <div class="demo-preview">
      <component :is="demoComponent" v-if="demoComponent" />
      <p v-else class="demo-preview__missing">示例组件未能加载。</p>
    </div>

    <!-- 源码区域 -->
    <div v-if="showSource" class="demo-source">
      <div v-if="highlightedCode" v-html="highlightedCode"></div>
      <pre v-else><code>{{ source }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  margin: 18px 0 24px;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 32px hsl(var(--foreground) / 6%);
}

.demo-preview {
  min-height: 92px;
  padding: 26px 28px;
  background: hsl(var(--card));
  border-bottom: 1px solid hsl(var(--border));
}

.demo-preview__missing {
  margin: 0;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}

.demo-preview > * + * {
  margin-top: 12px;
}

.demo-source {
  background: hsl(var(--background-deep) / 72%);
}

/* Shiki 样式覆盖 */
.demo-source :deep(pre.shiki) {
  padding: 18px 20px;
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  background-color: #f6f8fa !important;
  border: none;
  border-radius: 0;
}

:global(html.dark) .demo-source :deep(pre.shiki),
:global(html[data-theme='dark']) .demo-source :deep(pre.shiki) {
  background-color: var(--shiki-dark-bg) !important;
}

:global(html.dark) .demo-source :deep(pre.shiki span),
:global(html[data-theme='dark']) .demo-source :deep(pre.shiki span) {
  color: var(--shiki-dark) !important;
}

.demo-source :deep(pre.shiki code) {
  padding: 0;
  font-size: inherit;
  background: none;
  border: none;
}
</style>
