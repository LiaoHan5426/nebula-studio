<script lang="ts">
export interface NebulaTimelineItem {
  description?: string;
  id: string;
  state?: 'complete' | 'current' | 'error' | 'pending';
  timestamp?: string;
  title: string;
}
</script>

<script setup lang="ts">
withDefaults(defineProps<{ items: NebulaTimelineItem[]; label?: string }>(), {
  label: '状态进度',
});
</script>

<template>
  <ol class="nebula-status-timeline" :aria-label="label">
    <li
      v-for="item in items"
      :key="item.id"
      class="nebula-status-timeline__item"
      :class="`is-${item.state ?? 'pending'}`"
      :aria-current="item.state === 'current' ? 'step' : undefined"
    >
      <span class="nebula-status-timeline__marker" aria-hidden="true"></span>
      <div class="nebula-status-timeline__content">
        <div class="nebula-status-timeline__heading">
          <strong>{{ item.title }}</strong>
          <time v-if="item.timestamp">{{ item.timestamp }}</time>
        </div>
        <p v-if="item.description">{{ item.description }}</p>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.nebula-status-timeline {
  display: grid;
  gap: 0;
  padding: 0;
  margin: 0;
  list-style: none;
}

.nebula-status-timeline__item {
  position: relative;
  display: grid;
  grid-template-columns: 1.25rem minmax(0, 1fr);
  gap: var(--space-3, 0.75rem);
  padding-bottom: var(--space-5, 1.25rem);
}

.nebula-status-timeline__item:not(:last-child)::before {
  position: absolute;
  top: 1rem;
  bottom: 0;
  left: 0.4375rem;
  width: 1px;
  content: '';
  background: hsl(var(--border));
}

.nebula-status-timeline__marker {
  z-index: 1;
  width: 0.875rem;
  height: 0.875rem;
  margin-top: 0.2rem;
  background: hsl(var(--muted));
  border: 2px solid hsl(var(--border));
  border-radius: 50%;
}

.nebula-status-timeline__item.is-complete .nebula-status-timeline__marker,
.nebula-status-timeline__item.is-current .nebula-status-timeline__marker {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.nebula-status-timeline__item.is-current .nebula-status-timeline__marker {
  box-shadow: var(--focus-ring);
}

.nebula-status-timeline__item.is-error .nebula-status-timeline__marker {
  background: hsl(var(--destructive));
  border-color: hsl(var(--destructive));
}

.nebula-status-timeline__heading {
  display: flex;
  gap: var(--space-3, 0.75rem);
  align-items: baseline;
  justify-content: space-between;
}

.nebula-status-timeline__heading time,
.nebula-status-timeline__content p {
  font-size: var(--font-size-caption, 0.75rem);
  color: hsl(var(--muted-foreground));
}

.nebula-status-timeline__content p {
  margin: var(--space-1, 0.25rem) 0 0;
  line-height: var(--line-height-body, 1.6);
}
</style>
