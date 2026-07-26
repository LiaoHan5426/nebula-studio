<script setup lang="ts">
import { computed, useSlots } from 'vue';

import type {
  ContentWidth,
  ExperienceDensity,
  ExperienceSurface,
} from '../../types/layout';

const props = withDefaults(
  defineProps<{
    surface: Exclude<ExperienceSurface, 'auth' | 'shell'>;
    density?: ExperienceDensity;
    contentWidth?: ContentWidth;
    title?: string;
    description?: string;
    eyebrow?: string;
    embedded?: boolean;
    navigationLabel?: string;
  }>(),
  {
    density: 'comfortable',
    contentWidth: 'standard',
    title: '',
    description: '',
    eyebrow: '',
    embedded: false,
    navigationLabel: '页面导航',
  },
);

const slots = useSlots();
const hasHeading = computed(
  () =>
    Boolean(props.title || props.description || props.eyebrow) ||
    Boolean(slots.header),
);
</script>

<template>
  <div
    class="nebula-experience-layout"
    :class="[
      `is-${surface}`,
      `is-${density}`,
      `is-width-${contentWidth}`,
      { 'is-embedded': embedded },
    ]"
    :data-nebula-surface="surface"
    :data-nebula-density="density"
  >
    <aside
      v-if="$slots.navigation"
      class="nebula-experience-layout__navigation"
      :aria-label="navigationLabel"
    >
      <slot name="navigation" />
    </aside>

    <section class="nebula-experience-layout__main">
      <header v-if="hasHeading" class="nebula-experience-layout__header">
        <slot name="header">
          <p v-if="eyebrow" class="nebula-experience-layout__eyebrow">
            {{ eyebrow }}
          </p>
          <h1 v-if="title" class="nebula-experience-layout__title">
            {{ title }}
          </h1>
          <p v-if="description" class="nebula-experience-layout__description">
            {{ description }}
          </p>
        </slot>
        <div v-if="$slots.actions" class="nebula-experience-layout__actions">
          <slot name="actions" />
        </div>
      </header>

      <main class="nebula-experience-layout__content">
        <div class="nebula-experience-layout__content-inner">
          <slot />
        </div>
      </main>
    </section>
  </div>
</template>
