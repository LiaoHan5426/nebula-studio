<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description?: string;
    divided?: boolean;
  }>(),
  {
    description: '',
    divided: true,
  },
);
</script>

<template>
  <section class="nebula-detail-section" :class="{ 'is-divided': divided }">
    <header class="nebula-detail-section__header">
      <div>
        <h2>{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="nebula-detail-section__actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="nebula-detail-section__content">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.nebula-detail-section {
  display: grid;
  gap: var(--space-4, 1rem);
  min-width: 0;
}

.nebula-detail-section.is-divided {
  padding-bottom: var(--space-6, 1.5rem);
  border-bottom: 1px solid hsl(var(--border) / 68%);
}

.nebula-detail-section__header {
  display: flex;
  gap: var(--space-4, 1rem);
  align-items: flex-start;
  justify-content: space-between;
}

.nebula-detail-section h2 {
  margin: 0;
  font-size: var(--font-size-heading, 1.125rem);
}

.nebula-detail-section p {
  margin: var(--space-1, 0.25rem) 0 0;
  font-size: var(--font-size-caption, 0.75rem);
  line-height: var(--line-height-body, 1.6);
  color: hsl(var(--muted-foreground));
}

.nebula-detail-section__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
}
</style>
