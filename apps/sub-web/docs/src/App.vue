<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue';
import { DOCS_NAVIGATE_TO_FEATURE } from './docsNavigation';
import type { DocsNavigateToFeature } from './docsNavigation';

const pageModules = import.meta.glob('./pages/**/feature.ts', { eager: true });

interface PageDefinition {
  id: string;
  title: string;
  component: any;
}

const pages = Object.values(pageModules)
  .map((mod) => (mod as { default: PageDefinition }).default)
  .toSorted((a, b) => a.title.localeCompare(b.title));

const pagesById = new Map(pages.map((page) => [page.id, page]));

const activePageId = ref('home');

watch(activePageId, () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
});

const navigateToPage: DocsNavigateToFeature = (pageId: string) => {
  if (pagesById.has(pageId)) activePageId.value = pageId;
};
provide(DOCS_NAVIGATE_TO_FEATURE, navigateToPage);

const activePage = computed(() => pagesById.get(activePageId.value));
</script>

<template>
  <main class="docs-app">
    <component :is="activePage?.component" v-if="activePage?.component" />
  </main>
</template>

<style lang="scss" scoped>
.docs-app {
  min-height: 100vh;
  background: hsl(var(--background));
}
</style>
