<script setup lang="ts">
import { reactive } from 'vue';

const versions = reactive({ ...window.electron.process.versions });
</script>

<template>
  <ul class="versions">
    <li class="version-chip">
      <span class="version-key">Electron</span>
      <span class="version-value">{{ versions.electron }}</span>
    </li>
    <li class="version-chip">
      <span class="version-key">Chromium</span>
      <span class="version-value">{{ versions.chrome }}</span>
    </li>
    <li class="version-chip">
      <span class="version-key">Node</span>
      <span class="version-value">{{ versions.node }}</span>
    </li>
  </ul>
</template>

<style scoped>
.versions {
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: max-content;
}

.version-chip {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 4px 9px;
  font-size: 11px;
  line-height: 1;
  color: hsl(var(--foreground));
  white-space: nowrap;
  background: hsl(var(--muted) / 70%);
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
}

.version-key {
  color: hsl(var(--muted-foreground));
}

.version-value {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  color: hsl(var(--foreground));
}
</style>
