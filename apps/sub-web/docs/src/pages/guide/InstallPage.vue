<script setup lang="ts">
import MarkdownPage from '@/components/MarkdownPage.vue';
import source from '@/docs/guide/install.md?raw';
</script>

<template>
  <MarkdownPage :source="source" />
</template>
