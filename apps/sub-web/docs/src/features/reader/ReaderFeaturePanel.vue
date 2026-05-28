<script setup lang="ts">
import { NebulaAnchor } from '@nebula-studio/nebula-ui';
import { readerDocAnchorItems } from './demos/readerDocAnchors';
import ReaderMarkdownDemo from './demos/ReaderMarkdownDemo.vue';
import ReaderPlainDemo from './demos/ReaderPlainDemo.vue';
</script>

<template>
  <div class="reader-layout">
    <NebulaAnchor
      :items="[...readerDocAnchorItems]"
      title="On This Page"
      responsive
      back-top
      back-top-mode="float"
    />
    <section class="reader-docs">
      <ReaderMarkdownDemo />
      <ReaderPlainDemo />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.reader-layout {
  position: relative;
}

.reader-docs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
