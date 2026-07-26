<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description?: string;
    typeLabel?: string;
    provider?: string;
    interactive?: boolean;
  }>(),
  {
    description: '',
    typeLabel: '',
    provider: '',
    interactive: false,
  },
);
</script>

<template>
  <article
    class="nebula-resource-card"
    :class="{ 'is-interactive': interactive }"
  >
    <header class="nebula-resource-card__header">
      <div class="nebula-resource-card__identity">
        <span v-if="typeLabel" class="nebula-resource-card__type">
          {{ typeLabel }}
        </span>
        <h2>{{ title }}</h2>
      </div>
      <slot name="status" />
    </header>
    <p v-if="description" class="nebula-resource-card__description">
      {{ description }}
    </p>
    <div v-if="$slots.metadata || provider" class="nebula-resource-card__meta">
      <span v-if="provider">提供方：{{ provider }}</span>
      <slot name="metadata" />
    </div>
    <div v-if="$slots.tags" class="nebula-resource-card__tags">
      <slot name="tags" />
    </div>
    <footer v-if="$slots.actions" class="nebula-resource-card__actions">
      <slot name="actions" />
    </footer>
  </article>
</template>

<style scoped>
.nebula-resource-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 0.75rem);
  min-width: 0;
  padding: var(--space-5, 1.25rem);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border) / 76%);
  border-radius: var(--radius-lg, 0.9rem);
  box-shadow: 0 8px 24px hsl(var(--foreground) / 4%);
  transition:
    border-color var(--motion-fast, 140ms) ease,
    transform var(--motion-fast, 140ms) ease,
    box-shadow var(--motion-fast, 140ms) ease;
}

.nebula-resource-card.is-interactive:hover {
  border-color: hsl(var(--primary) / 45%);
  box-shadow: 0 14px 34px hsl(var(--foreground) / 8%);
  transform: translateY(-2px);
}

.nebula-resource-card__header {
  display: flex;
  gap: var(--space-3, 0.75rem);
  align-items: flex-start;
  justify-content: space-between;
}

.nebula-resource-card__identity {
  min-width: 0;
}

.nebula-resource-card__type {
  font-size: var(--font-size-caption, 0.75rem);
  font-weight: 700;
  color: hsl(var(--primary));
}

.nebula-resource-card h2 {
  margin: var(--space-1, 0.25rem) 0 0;
  font-size: var(--font-size-heading, 1.125rem);
  line-height: 1.35;
}

.nebula-resource-card__description {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  -webkit-line-clamp: 3;
  font-size: var(--font-size-body, 0.875rem);
  line-height: var(--line-height-body, 1.6);
  color: hsl(var(--muted-foreground));
  -webkit-box-orient: vertical;
}

.nebula-resource-card__meta,
.nebula-resource-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
  font-size: var(--font-size-caption, 0.75rem);
  color: hsl(var(--muted-foreground));
}

.nebula-resource-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
  align-items: center;
  padding-top: var(--space-3, 0.75rem);
  margin-top: auto;
  border-top: 1px solid hsl(var(--border) / 60%);
}

@media (prefers-reduced-motion: reduce) {
  .nebula-resource-card {
    transition: none;
  }

  .nebula-resource-card.is-interactive:hover {
    transform: none;
  }
}
</style>
