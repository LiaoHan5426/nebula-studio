<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Component } from 'vue';
import { getHighlighter } from '@/utils/highlighter';

const props = defineProps<{
  component: Component;
  source: string;
  id?: string;
}>();

const highlightedCode = ref('');

/**
 * 对源代码进行高亮处理。
 */
async function highlightSource() {
  try {
    const h = await getHighlighter();
    highlightedCode.value = h.codeToHtml(props.source, {
      lang: 'vue',
      theme: 'github-dark',
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
function escapeHtml(text: string): string {
  return text
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
      <component :is="component" />
    </div>

    <!-- 源码区域 -->
    <div class="demo-source">
      <div v-if="highlightedCode" v-html="highlightedCode" />
      <pre v-else><code>{{ source }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  margin: 16px 0;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.demo-preview {
  padding: 24px;
  background: hsl(var(--card));
  border-bottom: 1px solid hsl(var(--border));
}

.demo-preview > * + * {
  margin-top: 12px;
}

.demo-source {
  background: hsl(var(--muted) / 24%);
}

/* Shiki 样式覆盖 */
.demo-source :deep(pre.shiki) {
  padding: 16px;
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  background: transparent;
  border: none;
  border-radius: 0;
}

.demo-source :deep(pre.shiki code) {
  padding: 0;
  font-size: inherit;
  background: none;
  border: none;
}
</style>
