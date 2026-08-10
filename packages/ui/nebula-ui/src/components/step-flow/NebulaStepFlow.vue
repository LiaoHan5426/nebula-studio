<script lang="ts">
export interface NebulaStepItem {
  description?: string;
  id: string;
  label: string;
  state?: 'complete' | 'current' | 'error' | 'pending';
}
</script>

<script setup lang="ts">
withDefaults(defineProps<{ label?: string; steps: NebulaStepItem[] }>(), {
  label: '流程步骤',
});
</script>

<template>
  <ol class="nebula-step-flow" :aria-label="label">
    <li
      v-for="(step, index) in steps"
      :key="step.id"
      class="nebula-step-flow__item"
      :class="`is-${step.state ?? 'pending'}`"
      :aria-current="step.state === 'current' ? 'step' : undefined"
    >
      <span class="nebula-step-flow__number" aria-hidden="true">
        {{ step.state === 'complete' ? '✓' : index + 1 }}
      </span>
      <span class="nebula-step-flow__copy">
        <strong>{{ step.label }}</strong>
        <small v-if="step.description">{{ step.description }}</small>
      </span>
    </li>
  </ol>
</template>

<style scoped>
.nebula-step-flow {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: var(--space-3, 0.75rem);
  padding: 0;
  margin: 0;
  list-style: none;
}

.nebula-step-flow__item {
  display: flex;
  gap: var(--space-3, 0.75rem);
  align-items: flex-start;
  min-width: 0;
  padding: var(--space-3, 0.75rem);
  background: hsl(var(--muted) / 22%);
  border: 1px solid hsl(var(--border) / 70%);
  border-radius: var(--radius-md, 0.65rem);
}

.nebula-step-flow__number {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  font-size: var(--font-size-caption, 0.75rem);
  font-weight: 700;
  background: hsl(var(--muted));
  border-radius: 50%;
}

.nebula-step-flow__item.is-complete .nebula-step-flow__number,
.nebula-step-flow__item.is-current .nebula-step-flow__number {
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
}

.nebula-step-flow__item.is-current {
  border-color: hsl(var(--primary) / 45%);
}

.nebula-step-flow__item.is-error .nebula-step-flow__number {
  color: white;
  background: hsl(var(--destructive));
}

.nebula-step-flow__copy {
  display: grid;
  min-width: 0;
}

.nebula-step-flow__copy small {
  margin-top: var(--space-1, 0.25rem);
  line-height: 1.45;
  color: hsl(var(--muted-foreground));
}
</style>
