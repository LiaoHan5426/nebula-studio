<script setup lang="ts">
const scope = () =>
  typeof window.api === 'object' && window.api !== null && 'scope' in window.api
    ? String((window.api as { scope?: string }).scope)
    : '?';
</script>

<template>
  <main class="wrap">
    <h1>PDM renderer</h1>
    <p class="muted">Package <code>@nebula-studio-renderer/pdm</code></p>
    <p>
      Preload scope: <code>{{ scope() }}</code>
    </p>
  </main>
</template>

<style scoped>
.wrap {
  min-height: 100vh;
  padding: 2rem;
  font-family: system-ui, sans-serif;
  color: #e8e8ef;
  background: #1a1a22;
}

h1 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
}

.muted {
  margin-bottom: 1rem;
  color: #9898a8;
}

code {
  font-size: 0.9em;
}
</style>
