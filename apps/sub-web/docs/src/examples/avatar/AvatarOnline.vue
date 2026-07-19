<script setup lang="ts">
import { NebulaAvatar } from '@nebula-studio/nebula-ui';
</script>

<template>
  <div class="doc-demo-row">
    <NebulaAvatar text="在" status="online" />
    <NebulaAvatar text="离" status="offline" />
    <NebulaAvatar text="开" status="away" />
    <NebulaAvatar text="忙" status="busy" />
  </div>
</template>
