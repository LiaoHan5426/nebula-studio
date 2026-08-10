<script setup lang="ts">
withDefaults(
  defineProps<{
    busy?: boolean;
    description?: string;
    title: string;
    tone?: 'error' | 'neutral' | 'restricted';
  }>(),
  {
    description: '',
    tone: 'neutral',
    busy: false,
  },
);
</script>

<template>
  <section
    class="nebula-empty-state"
    :class="`is-${tone}`"
    :aria-busy="busy"
    :role="tone === 'error' ? 'alert' : 'status'"
  >
    <div class="nebula-empty-state__icon" aria-hidden="true">
      <slot name="icon">
        <span>{{
          tone === 'error' ? '!' : tone === 'restricted' ? '×' : '·'
        }}</span>
      </slot>
    </div>
    <h2>{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
    <div v-if="$slots.actions" class="nebula-empty-state__actions">
      <slot name="actions"></slot>
    </div>
  </section>
</template>

<style scoped>
.nebula-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 16rem;
  padding: var(--space-8, 2rem);
  text-align: center;
  background: hsl(var(--muted) / 18%);
  border: 1px dashed hsl(var(--border));
  border-radius: var(--radius-lg, 0.9rem);
}

.nebula-empty-state__icon {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  margin-bottom: var(--space-4, 1rem);
  font-size: 1.5rem;
  font-weight: 700;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 10%);
  border-radius: 1rem;
}

.nebula-empty-state.is-error .nebula-empty-state__icon {
  color: hsl(var(--destructive));
  background: hsl(var(--destructive) / 10%);
}

.nebula-empty-state h2 {
  margin: 0;
  font-size: var(--font-size-heading, 1.125rem);
}

.nebula-empty-state p {
  max-width: 34rem;
  margin: var(--space-2, 0.5rem) 0 0;
  line-height: var(--line-height-body, 1.6);
  color: hsl(var(--muted-foreground));
}

.nebula-empty-state__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
  justify-content: center;
  margin-top: var(--space-5, 1.25rem);
}
</style>
