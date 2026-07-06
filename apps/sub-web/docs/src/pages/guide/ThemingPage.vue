<script setup lang="ts">
import MarkdownPage from '@/components/MarkdownPage.vue';

// eslint-disable-next-line import/no-duplicates
import source from '@/docs/guide/theming.md?raw';
</script>

<template>
  <MarkdownPage :source="source" />
</template>
