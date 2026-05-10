<script setup lang="ts">
import EditorCodePreviewDemo from './demos/EditorCodePreviewDemo.vue';
import EditorMarkdownMixedDemo from './demos/EditorMarkdownMixedDemo.vue';
import EditorMarkdownPaneDemo from './demos/EditorMarkdownPaneDemo.vue';
import EditorRichTextDemo from './demos/EditorRichTextDemo.vue';
</script>

<template>
  <section class="editor-docs">
    <EditorMarkdownPaneDemo />
    <EditorMarkdownMixedDemo />
    <EditorCodePreviewDemo />
    <EditorRichTextDemo />
  </section>
</template>

<style scoped>
.editor-docs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
