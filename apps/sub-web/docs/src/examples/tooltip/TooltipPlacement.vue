<script setup lang="ts">
import { NebulaTooltip, NebulaButton } from '@nebula-studio/nebula-ui';

const placements = ['top', 'bottom', 'left', 'right'] as const;
</script>

<template>
  <div class="doc-demo-row">
    <NebulaTooltip
      v-for="p in placements"
      :key="p"
      :content="`提示在 ${p}`"
      :placement="p"
    >
      <NebulaButton>{{ p }}</NebulaButton>
    </NebulaTooltip>
  </div>
</template>
