<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';

import AppLayout from '@/app/AppLayout.vue';
import { ensureAuthFromShell } from '@/shared/composables/useAuth';

onMounted(async () => {
  await ensureAuthFromShell();
});
</script>

<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
