<script setup lang="ts">
import NebulaButton from '../button/NebulaButton.vue';
import NebulaInput from '../input/NebulaInput.vue';

withDefaults(
  defineProps<{
    description?: string;
    placeholder?: string;
    submitLabel?: string;
    title: string;
  }>(),
  {
    description: '',
    placeholder: '搜索资源、应用或文档',
    submitLabel: '搜索',
  },
);

const emit = defineEmits<{ search: [keyword: string] }>();
const model = defineModel<string>({ default: '' });
</script>

<template>
  <section class="nebula-search-hero" aria-labelledby="nebula-search-title">
    <div class="nebula-search-hero__copy">
      <h1 id="nebula-search-title">{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
    </div>
    <form
      class="nebula-search-hero__form"
      role="search"
      @submit.prevent="emit('search', model.trim())"
    >
      <NebulaInput
        v-model="model"
        type="text"
        :placeholder="placeholder"
        aria-label="搜索关键词"
      />
      <NebulaButton type="submit" variant="primary">
        {{ submitLabel }}
      </NebulaButton>
    </form>
    <div v-if="$slots.suggestions" class="nebula-search-hero__suggestions">
      <slot name="suggestions"></slot>
    </div>
  </section>
</template>

<style scoped>
.nebula-search-hero {
  position: relative;
  display: grid;
  gap: var(--space-6, 1.5rem);
  padding: clamp(1.5rem, 4vw, 3.5rem);
  overflow: hidden;
  background:
    radial-gradient(
      circle at 90% 10%,
      hsl(var(--primary) / 18%),
      transparent 18rem
    ),
    linear-gradient(145deg, hsl(var(--card)), hsl(var(--muted) / 28%));
  border: 1px solid hsl(var(--border) / 72%);
  border-radius: var(--radius-xl, 1.2rem);
  box-shadow: var(--shadow-surface);
}

.nebula-search-hero__copy {
  max-width: 44rem;
}

.nebula-search-hero h1 {
  margin: 0;
  font-size: var(--font-size-display, 2.5rem);
  line-height: var(--line-height-display, 1.08);
  letter-spacing: -0.045em;
}

.nebula-search-hero p {
  margin: var(--space-3, 0.75rem) 0 0;
  line-height: var(--line-height-body, 1.6);
  color: hsl(var(--muted-foreground));
}

.nebula-search-hero__form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-2, 0.5rem);
  width: min(42rem, 100%);
}

.nebula-search-hero__suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
  font-size: var(--font-size-caption, 0.75rem);
}

@media (width <= 32rem) {
  .nebula-search-hero__form {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
