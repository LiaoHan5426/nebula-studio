<script setup lang="ts">
import type { ResourceAvailability } from './types';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import {
  NebulaButton,
  NebulaEmptyState,
  NebulaInput,
  NebulaPageHeader,
  NebulaSelect,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { errorMessageKey, mapIntegrationErrorCode } from '@/shared/i18n/errors';

import { resourceTypeRegistry } from './registry';
import { DEFAULT_CATALOG_QUERY } from './types';
import { useResourceCatalogPage } from './useResourceCatalogPage';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const {
  error,
  favorites,
  filteredItems,
  items,
  load,
  loading,
  openResource,
  pageCount,
  pendingRequestCount,
  query,
  recentItems,
  toggleFavorite,
  unavailableSources,
  visibleItems,
} = useResourceCatalogPage(route, router);

const providers = computed(() => [
  { label: t('catalog.filter.allProviders'), value: '' },
  ...Array.from(new Set(items.value.map((item) => item.provider)))
    .toSorted()
    .map((value) => ({ label: value, value })),
]);
const tags = computed(() => [
  { label: t('catalog.filter.allTags'), value: '' },
  ...Array.from(new Set(items.value.flatMap((item) => item.tags)))
    .toSorted()
    .map((value) => ({ label: value, value })),
]);

const catalogError = computed(() =>
  error.value ? t(errorMessageKey(mapIntegrationErrorCode(error.value))) : '',
);

function availabilityLabel(value: ResourceAvailability): string {
  return t(`catalog.availability.${value}`);
}

function sourceLabel(id: string): string {
  return t(`catalog.sources.${id}`);
}
</script>

<template>
  <main class="portal-page">
    <section class="catalog-hero">
      <NebulaPageHeader
        :eyebrow="t('catalog.eyebrow')"
        :title="t('catalog.title')"
        :description="t('catalog.description')"
      >
        <template #actions>
          <NebulaButton variant="outline" @click="router.push('/my-requests')">
            {{ t('catalog.viewRequests') }}
          </NebulaButton>
          <NebulaButton @click="router.push('/my-resources')">
            {{ t('catalog.myResources') }}
          </NebulaButton>
        </template>
      </NebulaPageHeader>
      <label class="hero-search">
        <span>{{ t('catalog.searchLabel') }}</span>
        <NebulaInput
          v-model="query.keyword"
          :placeholder="t('catalog.searchPlaceholder')"
          :aria-label="t('catalog.searchAria')"
        />
      </label>
      <div class="hero-stats">
        <span><strong>{{ items.length }}</strong>
          {{ t('catalog.stats.discoverable') }}</span>
        <span><strong>{{ favorites.length }}</strong>
          {{ t('catalog.stats.favorites') }}</span>
        <span><strong>{{ recentItems.length }}</strong>
          {{ t('catalog.stats.recent') }}</span>
        <span><strong>{{ pendingRequestCount }}</strong>
          {{ t('catalog.stats.pending') }}</span>
      </div>
    </section>

    <section v-if="recentItems.length" class="recent-strip">
      <div>
        <span class="section-eyebrow">{{ t('catalog.continueEyebrow') }}</span>
        <h2>{{ t('catalog.recentTitle') }}</h2>
      </div>
      <button
        v-for="resource in recentItems"
        :key="resource.id"
        type="button"
        class="recent-chip"
        @click="openResource(resource)"
      >
        <span>{{ resourceTypeRegistry[resource.kind].accent }}</span>
        {{ resource.name }}
      </button>
    </section>

    <section class="catalog-section">
      <div class="catalog-heading">
        <div>
          <span class="section-eyebrow">{{ t('catalog.browseEyebrow') }}</span>
          <h2>{{ t('catalog.browseTitle') }}</h2>
        </div>
        <p>{{ t('catalog.matchCount', { n: filteredItems.length }) }}</p>
      </div>

      <div class="filters" :aria-label="t('catalog.filter.aria')">
        <NebulaSelect
          v-model="query.kind"
          :options="[
            { label: t('catalog.filter.allKinds'), value: '' },
            { label: t('catalog.filter.api'), value: 'API' },
            { label: t('catalog.filter.table'), value: 'TABLE' },
            { label: t('catalog.filter.connector'), value: 'CONNECTOR' },
          ]"
          :aria-label="t('catalog.filter.kindAria')"
        />
        <NebulaSelect
          v-model="query.provider"
          :options="providers"
          :aria-label="t('catalog.filter.providerAria')"
        />
        <NebulaSelect
          v-model="query.tag"
          :options="tags"
          :aria-label="t('catalog.filter.tagAria')"
        />
        <NebulaSelect
          v-model="query.availability"
          :options="[
            { label: t('catalog.filter.allAvailability'), value: '' },
            { label: t('catalog.availability.AVAILABLE'), value: 'AVAILABLE' },
            {
              label: t('catalog.availability.APPROVAL_REQUIRED'),
              value: 'APPROVAL_REQUIRED',
            },
            {
              label: t('catalog.availability.UNAVAILABLE'),
              value: 'UNAVAILABLE',
            },
            { label: t('catalog.availability.OFFLINE'), value: 'OFFLINE' },
          ]"
          :aria-label="t('catalog.filter.availabilityAria')"
        />
        <NebulaSelect
          v-model="query.sort"
          :options="[
            { label: t('catalog.filter.sortRelevance'), value: 'RELEVANCE' },
            { label: t('catalog.filter.sortUpdated'), value: 'UPDATED' },
            { label: t('catalog.filter.sortName'), value: 'NAME' },
          ]"
          :aria-label="t('catalog.filter.sortAria')"
        />
        <NebulaButton
          variant="outline"
          @click="Object.assign(query, DEFAULT_CATALOG_QUERY)"
        >
          {{ t('catalog.clearFilters') }}
        </NebulaButton>
      </div>

      <p v-if="unavailableSources.length" class="partial-notice" role="status">
        {{
          t('catalog.partialUnavailable', {
            sources: unavailableSources
              .map(sourceLabel)
              .join(t('catalog.sourceJoin')),
          })
        }}
        <button type="button" @click="load">{{ t('common.reload') }}</button>
      </p>

      <div
        v-if="loading"
        class="resource-grid"
        :aria-label="t('catalog.loadingAria')"
      >
        <div v-for="index in 6" :key="index" class="resource-skeleton"></div>
      </div>
      <NebulaEmptyState
        v-else-if="catalogError"
        :title="t('catalog.loadFailed')"
        :description="catalogError"
      >
        <NebulaButton @click="load">{{ t('common.reload') }}</NebulaButton>
      </NebulaEmptyState>
      <NebulaEmptyState
        v-else-if="visibleItems.length === 0"
        :title="t('catalog.emptyTitle')"
        :description="t('catalog.emptyBody')"
      >
        <NebulaButton @click="Object.assign(query, DEFAULT_CATALOG_QUERY)">
          {{ t('catalog.clearFilters') }}
        </NebulaButton>
      </NebulaEmptyState>
      <div v-else class="resource-grid">
        <article
          v-for="resource in visibleItems"
          :key="resource.id"
          class="resource-card"
        >
          <div class="resource-card__top">
            <span class="resource-kind">
              {{ resourceTypeRegistry[resource.kind].accent }}
            </span>
            <button
              type="button"
              class="favorite-button"
              :aria-label="
                favorites.includes(resource.id)
                  ? t('catalog.unfavoriteAria')
                  : t('catalog.favoriteAria')
              "
              :aria-pressed="favorites.includes(resource.id)"
              @click="toggleFavorite(resource)"
            >
              {{ favorites.includes(resource.id) ? '★' : '☆' }}
            </button>
          </div>
          <button
            type="button"
            class="resource-card__body"
            @click="openResource(resource)"
          >
            <span class="resource-provider">{{ resource.provider }}</span>
            <h3>{{ resource.name }}</h3>
            <p>{{ resource.description }}</p>
          </button>
          <div class="resource-tags">
            <NebulaTag>
              {{ availabilityLabel(resource.availability) }}
            </NebulaTag>
            <NebulaTag v-for="tag in resource.tags.slice(0, 2)" :key="tag">
              {{ tag }}
            </NebulaTag>
          </div>
          <div class="resource-card__footer">
            <span>{{ resource.version }}</span>
            <NebulaButton size="sm" @click="openResource(resource)">
              {{ t('catalog.viewDetail') }}
            </NebulaButton>
          </div>
        </article>
      </div>

      <nav
        v-if="pageCount > 1"
        class="pagination"
        :aria-label="t('catalog.paginationAria')"
      >
        <NebulaButton
          variant="outline"
          :disabled="query.page <= 1"
          @click="query.page -= 1"
        >
          {{ t('catalog.prevPage') }}
        </NebulaButton>
        <span>{{
          t('catalog.pageOf', { page: query.page, total: pageCount })
        }}</span>
        <NebulaButton
          variant="outline"
          :disabled="query.page >= pageCount"
          @click="query.page += 1"
        >
          {{ t('catalog.nextPage') }}
        </NebulaButton>
      </nav>
    </section>
  </main>
</template>

<style scoped>
.portal-page {
  display: grid;
  gap: var(--space-6);
  max-width: 1280px;
  padding: var(--space-6);
  margin: 0 auto;
}

.catalog-hero {
  display: grid;
  gap: var(--space-5);
  padding: clamp(24px, 4vw, 48px);
  overflow: hidden;
  background:
    radial-gradient(
      circle at 85% 0%,
      hsl(var(--primary) / 22%),
      transparent 34%
    ),
    linear-gradient(135deg, hsl(var(--card)), hsl(var(--muted) / 55%));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius-lg) + 8px);
}

.hero-search {
  display: grid;
  gap: var(--space-2);
  max-width: 760px;
  font-size: var(--font-size-caption);
  font-weight: 700;
}

.hero-search :deep(input) {
  min-height: 50px;
  padding-inline: 16px;
  font-size: 16px;
  background: hsl(var(--background) / 92%);
}

.hero-stats,
.recent-strip,
.filters,
.catalog-heading,
.resource-card__top,
.resource-card__footer,
.pagination {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}

.hero-stats {
  color: hsl(var(--muted-foreground));
}

.hero-stats span {
  padding-right: var(--space-4);
  border-right: 1px solid hsl(var(--border));
}

.hero-stats strong {
  color: hsl(var(--foreground));
}

.recent-strip {
  padding: var(--space-4);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
}

.recent-strip > div {
  margin-right: auto;
}

.recent-strip h2,
.catalog-heading h2 {
  margin: 2px 0 0;
  font-size: 20px;
}

.section-eyebrow,
.resource-provider {
  font-size: 11px;
  font-weight: 700;
  color: hsl(var(--primary));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.recent-chip {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 9px 12px;
  color: hsl(var(--foreground));
  cursor: pointer;
  background: hsl(var(--muted) / 55%);
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
}

.recent-chip span,
.resource-kind {
  font-size: 10px;
  font-weight: 800;
  color: hsl(var(--primary));
}

.catalog-section {
  display: grid;
  gap: var(--space-4);
}

.catalog-heading {
  justify-content: space-between;
}

.catalog-heading p {
  color: hsl(var(--muted-foreground));
}

.filters > * {
  flex: 1 1 170px;
}

.partial-notice {
  padding: 10px 12px;
  margin: 0;
  color: hsl(var(--warning-foreground, var(--foreground)));
  background: hsl(var(--warning, 40 90% 55%) / 12%);
  border-radius: var(--radius-md);
}

.partial-notice button {
  color: hsl(var(--primary));
  cursor: pointer;
  background: none;
  border: 0;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}

.resource-card {
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  gap: var(--space-3);
  min-height: 270px;
  padding: var(--space-5);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
}

.resource-card:hover {
  box-shadow: 0 16px 36px hsl(var(--foreground) / 8%);
  transform: translateY(-2px);
}

.resource-card__top,
.resource-card__footer {
  justify-content: space-between;
}

.favorite-button {
  width: 34px;
  height: 34px;
  font-size: 20px;
  color: hsl(var(--primary));
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 50%;
}

.favorite-button:focus-visible,
.resource-card__body:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 3px;
}

.resource-card__body {
  padding: 0;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.resource-card h3 {
  margin: 8px 0;
  font-size: 19px;
}

.resource-card p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  -webkit-line-clamp: 3;
  line-height: 1.65;
  color: hsl(var(--muted-foreground));
  -webkit-box-orient: vertical;
}

.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.resource-card__footer {
  padding-top: var(--space-3);
  color: hsl(var(--muted-foreground));
  border-top: 1px solid hsl(var(--border));
}

.resource-skeleton {
  min-height: 270px;
  background: linear-gradient(
    90deg,
    hsl(var(--muted) / 50%),
    hsl(var(--muted)),
    hsl(var(--muted) / 50%)
  );
  background-size: 200% 100%;
  border-radius: var(--radius-lg);
  animation: pulse 1.3s infinite linear;
}

.pagination {
  justify-content: center;
}

@keyframes pulse {
  to {
    background-position: -200% 0;
  }
}

@media (width <= 900px) {
  .resource-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 620px) {
  .portal-page {
    padding: var(--space-4);
  }

  .resource-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .resource-card,
  .resource-skeleton {
    transition: none;
    animation: none;
  }
}
</style>
