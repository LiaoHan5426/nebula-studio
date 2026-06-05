<script setup lang="ts">
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
import MonacoTemplate from './MonacoTemplate.vue';
</script>

<template>
  <section id="monaco-demo">
    <DocsDemoSection title="Monaco示例" description="集成示例">
      <MonacoTemplate style="height: 300px" />
    </DocsDemoSection>
  </section>
</template>
