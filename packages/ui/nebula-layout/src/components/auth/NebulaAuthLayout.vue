<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    eyebrow?: string;
  }>(),
  {
    title: '',
    description: '',
    eyebrow: 'Nebula Studio',
  },
);
</script>

<template>
  <main
    class="nebula-auth-layout"
    data-nebula-surface="auth"
    data-nebula-density="comfortable"
  >
    <section class="nebula-auth-layout__shell">
      <aside v-if="$slots.brand" class="nebula-auth-layout__brand">
        <slot name="brand" />
      </aside>
      <section class="nebula-auth-layout__panel">
        <header class="nebula-auth-layout__header">
          <span v-if="eyebrow" class="nebula-auth-layout__eyebrow">
            {{ eyebrow }}
          </span>
          <h1 v-if="title">{{ title }}</h1>
          <p v-if="description">{{ description }}</p>
          <slot name="header" />
        </header>
        <div class="nebula-auth-layout__content">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="nebula-auth-layout__footer">
          <slot name="footer" />
        </footer>
      </section>
    </section>
  </main>
</template>
