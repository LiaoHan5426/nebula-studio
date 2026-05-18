<script setup lang="ts">
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
import MonacoEditor from '../integration/monaco-editor.vue';
</script>

<template>
  <section id="monaco-demo">
    <DocsDemoSection
      title="Monaco示例"
      description="集成示例"
    >
    <MonacoEditor/>
  </DocsDemoSection>
  </section>
</template>
