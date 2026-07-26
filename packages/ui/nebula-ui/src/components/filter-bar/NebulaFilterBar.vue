<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
    resultSummary?: string;
  }>(),
  {
    label: '筛选条件',
    resultSummary: '',
  },
);
</script>

<template>
  <section class="nebula-filter-bar" :aria-label="label">
    <div class="nebula-filter-bar__controls">
      <slot />
    </div>
    <p v-if="resultSummary" class="nebula-filter-bar__summary" role="status">
      {{ resultSummary }}
    </p>
    <div v-if="$slots.actions" class="nebula-filter-bar__actions">
      <slot name="actions" />
    </div>
  </section>
</template>

<style scoped>
.nebula-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3, 0.75rem);
  align-items: center;
  min-width: 0;
  padding: var(--space-3, 0.75rem);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border) / 72%);
  border-radius: var(--radius-lg, 0.9rem);
}

.nebula-filter-bar__controls,
.nebula-filter-bar__actions {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
  align-items: center;
  min-width: 0;
}

.nebula-filter-bar__actions {
  flex: 0 0 auto;
  justify-content: flex-end;
}

.nebula-filter-bar__summary {
  margin: 0;
  font-size: var(--font-size-caption, 0.75rem);
  color: hsl(var(--muted-foreground));
}
</style>
