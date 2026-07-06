<script setup lang="ts">
import MarkdownPage from '@/components/MarkdownPage.vue';

// eslint-disable-next-line import/no-duplicates
import source from '@/docs/guide/intro.md?raw';
</script>

<template>
  <MarkdownPage :source="source" />
</template>
