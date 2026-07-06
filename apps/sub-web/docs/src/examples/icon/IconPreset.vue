<script setup lang="ts">
import { NebulaIcon, PRESET_ICONS } from '@nebula-studio/nebula-ui';

const iconNames = Object.keys(PRESET_ICONS).slice(0, 12);
</script>

<template>
  <div class="doc-demo-row">
    <NebulaIcon v-for="name in iconNames" :key="name" :icon="name" size="24" />
  </div>
</template>
