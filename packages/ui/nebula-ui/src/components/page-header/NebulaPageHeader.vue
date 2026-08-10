<script setup lang="ts">
withDefaults(
  defineProps<{
    description?: string;
    eyebrow?: string;
    helpHref?: string;
    title: string;
  }>(),
  {
    description: '',
    eyebrow: '',
    helpHref: '',
  },
);
</script>

<template>
  <header class="nebula-page-header">
    <div class="nebula-page-header__copy">
      <p v-if="eyebrow" class="nebula-page-header__eyebrow">
        {{ eyebrow }}
      </p>
      <h1>{{ title }}</h1>
      <p v-if="description" class="nebula-page-header__description">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions || helpHref" class="nebula-page-header__actions">
      <slot name="actions"></slot>
      <a
        v-if="helpHref"
        class="nebula-page-header__help"
        :href="helpHref"
        aria-label="打开当前页面帮助"
      >
        帮助
      </a>
    </div>
  </header>
</template>

<style scoped>
.nebula-page-header {
  display: flex;
  gap: var(--space-4, 1rem) var(--space-6, 1.5rem);
  align-items: flex-end;
  justify-content: space-between;
  min-width: 0;
}

.nebula-page-header__copy {
  min-width: 0;
}

.nebula-page-header__eyebrow {
  margin: 0 0 var(--space-1, 0.25rem);
  font-size: var(--font-size-caption, 0.75rem);
  font-weight: 700;
  color: hsl(var(--primary));
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.nebula-page-header h1 {
  margin: 0;
  font-size: var(--font-size-title, 1.75rem);
  line-height: var(--line-height-title, 1.2);
  letter-spacing: -0.03em;
}

.nebula-page-header__description {
  max-width: 52rem;
  margin: var(--space-2, 0.5rem) 0 0;
  font-size: var(--font-size-body, 0.875rem);
  line-height: var(--line-height-body, 1.6);
  color: hsl(var(--muted-foreground));
}

.nebula-page-header__actions {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
  align-items: center;
}

.nebula-page-header__help {
  padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
  font-size: var(--font-size-caption, 0.75rem);
  font-weight: 600;
  color: hsl(var(--primary));
  text-decoration: none;
  border-radius: var(--radius-md, 0.65rem);
}

.nebula-page-header__help:hover {
  background: hsl(var(--primary) / 10%);
}

.nebula-page-header__help:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}

@media (width <= 40rem) {
  .nebula-page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
