```vue
<script setup lang="ts">
import { ref } from 'vue';
import { NebulaEditor } from '@nebula-studio/nebula-ui';

const html = ref(
  '<p>Hello <strong>Nebula</strong></p><p>wangEditor HTML → NebulaReader <code>format="html"</code></p>',
);
</script>

<template>
  <!-- prepareRichTextHtmlForReader 会去掉 script（bindingFromNebulaEditor 已内置） -->
  <!-- nebula-ui styles.css 含 @wangeditor/core 样式 -->
  <NebulaEditor
    v-model="html"
    variant="richtext"
    embed-preview
    :height="380"
    :show-toolbar="true"
  />
</template>
```

独立预览时可用 bindingFromNebulaEditor(html, { variant: 'richtext' }) 得到 NebulaReader 的 source/format。
