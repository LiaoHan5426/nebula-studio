<script setup lang="ts">
import { ref } from 'vue';
import { NebulaReader } from '@nebula-studio/nebula-ui';

const snippet = ref(`export function add(a: number, b: number): number {
  return a + b;
}
`);
</script>

<template>
  <NebulaReader
    :source="snippet"
    format="plain"
    plain-highlight-language="typescript"
  />
</template>
