<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { renderMarkdown } from '@/utils/markdown';

const props = defineProps<{
  source: string;
}>();

const renderedHtml = ref('');

onMounted(async () => {
  try {
    renderedHtml.value = await renderMarkdown(props.source);
  } catch (e) {
    console.error('Markdown render failed:', e);
  }
});
</script>

<template>
  <div class="markdown-body" v-html="renderedHtml" />
</template>
