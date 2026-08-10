<script setup lang="ts">
import { ref, watch } from 'vue';

import { renderMarkdown } from '@/utils/markdown';

const props = defineProps<{
  source: string;
}>();

const renderedHtml = ref('');

watch(
  () => props.source,
  async (source) => {
    try {
      renderedHtml.value = await renderMarkdown(source);
    } catch (error) {
      console.error('Markdown render failed:', error);
    }
  },
  { immediate: true },
);
</script>

<template>
  <article class="markdown-body" v-html="renderedHtml"></article>
</template>
