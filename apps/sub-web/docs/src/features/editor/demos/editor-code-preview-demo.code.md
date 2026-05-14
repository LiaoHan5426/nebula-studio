<script setup lang="ts">
import { ref } from 'vue';
import type { NebulaEditorCodeLanguage } from '@nebula-studio/nebula-ui';
import { NebulaEditor } from '@nebula-studio/nebula-ui';

const codeLang = ref<NebulaEditorCodeLanguage>('typescript');

const ts = ref(`interface Row {
  id: string;
  label: string;
}

export function pick<T>(xs: T[]): T | undefined {
  return xs[0];
}
`);
</script>

<template>
  <NebulaEditor
    v-model="ts"
    v-model:code-language="codeLang"
    variant="code"
    show-code-language-switch
    embed-preview
    :height="240"
  />
</template>
