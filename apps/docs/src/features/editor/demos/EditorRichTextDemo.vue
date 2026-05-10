<script setup lang="ts">
import { ref } from 'vue';
import { NebulaEditor } from '@nebula-studio/nebula-ui';
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
import editorRichTextDemoCode from './editor-richtext-demo.code.md?raw';

const html = ref('<p>Hello <strong>Nebula</strong></p><p>wangEditor HTML → NebulaReader <code>format="html"</code></p>');

const code = editorRichTextDemoCode;
</script>

<template>
  <section id="editor-richtext">
    <DocsDemoSection
      title="NebulaEditor（富文本 HTML） + 内嵌 NebulaReader"
      description="richtext 产出 HTML；工具栏仅「预览」开关（无语法下拉）。内嵌预览与左侧编辑区同高。"
      :code="code"
    >
      <NebulaEditor
        v-model="html"
        variant="richtext"
        embed-preview
        :height="380"
        :show-toolbar="true"
      />
    </DocsDemoSection>
  </section>
</template>
