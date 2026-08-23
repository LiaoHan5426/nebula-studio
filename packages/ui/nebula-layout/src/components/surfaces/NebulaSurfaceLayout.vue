<script setup lang="ts">
import type {
  ContentWidth,
  ExperienceDensity,
  ExperienceSurface,
} from '../../types/layout';

import { computed, useId, useSlots } from 'vue';

const props = withDefaults(
  defineProps<{
    contentWidth?: ContentWidth;
    density?: ExperienceDensity;
    description?: string;
    embedded?: boolean;
    eyebrow?: string;
    navigationLabel?: string;
    surface: Exclude<ExperienceSurface, 'auth' | 'shell'>;
    title?: string;
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
const contentId = `nebula-surface-content-${useId().replaceAll(':', '')}`;
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
    <a class="nebula-experience-layout__skip-link" :href="`#${contentId}`">
      跳到主要内容
    </a>
    <aside
      v-if="$slots.navigation"
      class="nebula-experience-layout__navigation"
      :aria-label="navigationLabel"
    >
      <slot name="navigation"></slot>
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
          <slot name="actions"></slot>
        </div>
      </header>

      <main :id="contentId" class="nebula-experience-layout__content" tabindex="-1">
        <div class="nebula-experience-layout__content-inner">
          <slot></slot>
        </div>
      </main>
    </section>
  </div>
</template>
