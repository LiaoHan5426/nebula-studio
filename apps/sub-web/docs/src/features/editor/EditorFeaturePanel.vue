<script setup lang="ts">
import { NebulaAnchor } from '@nebula-studio/nebula-ui';
import EditorCodePreviewDemo from './demos/EditorCodePreviewDemo.vue';
import { editorDocAnchorItems } from './demos/editorDocAnchors';
import EditorMarkdownMixedDemo from './demos/EditorMarkdownMixedDemo.vue';
import EditorMarkdownPaneDemo from './demos/EditorMarkdownPaneDemo.vue';
import EditorRichTextDemo from './demos/EditorRichTextDemo.vue';
</script>

<template>
  <div class="editor-layout">
    <NebulaAnchor
      :items="[...editorDocAnchorItems]"
      title="On This Page"
      responsive
      back-top
      back-top-mode="float"
    />
    <section class="editor-docs">
      <EditorMarkdownPaneDemo />
      <EditorMarkdownMixedDemo />
      <EditorCodePreviewDemo />
      <EditorRichTextDemo />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.editor-layout {
  position: relative;
}

.editor-docs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
