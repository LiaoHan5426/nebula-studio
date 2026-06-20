<script setup lang="ts">
import { NebulaAnchor } from '@nebula-studio/nebula-ui';
import MonacoBaseDemo from './demos/MonacoBaseDemo.vue';
import { monacoDocAnchorItems } from './demos/monacoDocAnchors';
</script>

<template>
  <div class="editor-layout nebula-anchor-rail">
    <NebulaAnchor
      :items="[...monacoDocAnchorItems]"
      title="On This Page"
      responsive
      back-top
      back-top-mode="float"
    />
    <section class="editor-docs">
      <MonacoBaseDemo />
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
