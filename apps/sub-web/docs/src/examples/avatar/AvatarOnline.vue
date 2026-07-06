<script setup lang="ts">
import { NebulaAvatar } from '@nebula-studio/nebula-ui';
</script>

<template>
  <div class="doc-demo-row">
    <NebulaAvatar text="在" :online="true" />
    <NebulaAvatar text="离" :online="false" />
  </div>
</template>
