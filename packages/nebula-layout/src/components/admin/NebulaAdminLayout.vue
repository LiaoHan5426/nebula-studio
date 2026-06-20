<script setup lang="ts">
defineProps<{
  title?: string;
  subtitle?: string;
}>();
</script>

<template>
  <div class="nebula-layout-admin">
    <aside class="nebula-layout-admin__sidebar">
      <header v-if="title || subtitle" class="nebula-layout-admin__head">
        <h1 v-if="title">{{ title }}</h1>
        <p v-if="subtitle">{{ subtitle }}</p>
      </header>
      <nav class="nebula-layout-admin__nav" aria-label="管理导航">
        <slot name="sidebar" />
      </nav>
    </aside>
    <div class="nebula-layout-admin__main">
      <header v-if="$slots.header" class="nebula-layout-admin__page-head">
        <slot name="header" />
      </header>
      <main class="nebula-layout-admin__body">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.nebula-layout-admin__head {
  padding: 20px 14px 10px;
}

.nebula-layout-admin__head h1 {
  margin: 0;
  font-size: 18px;
}

.nebula-layout-admin__head p {
  margin: 6px 0 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.nebula-layout-admin__nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px 16px;
}

.nebula-layout-admin__page-head {
  padding: 16px 20px 0;
}

.nebula-layout-admin__body {
  flex: 1;
  min-height: 0;
  padding: 16px 20px 20px;
  overflow: auto;
}
</style>
