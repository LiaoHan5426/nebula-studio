<script setup lang="ts">
import ReaderMarkdownDemo from './demos/ReaderMarkdownDemo.vue';
import ReaderPlainDemo from './demos/ReaderPlainDemo.vue';
</script>

<template>
  <section class="reader-docs">
    <ReaderMarkdownDemo />
    <ReaderPlainDemo />
  </section>
</template>

<style scoped>
.reader-docs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
