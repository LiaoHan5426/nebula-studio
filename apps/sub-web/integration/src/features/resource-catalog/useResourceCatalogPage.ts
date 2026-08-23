import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';

import type {
  CatalogQuery,
  ResourceAvailability,
  ResourceSummaryViewModel,
} from './types';

import { computed, onBeforeUnmount, onMounted, reactive, watch } from 'vue';

import { useTenant } from '@/shared/composables/useTenant';
import { usePortalStore } from '@/shared/state/portalStore';
import { useQuery } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';

import { catalogDetailPath } from './catalog-routes';
import {
  currentCatalogUserId,
  pendingAccessRequestCountQueryOptions,
  resourceCatalogQueryOptions,
} from './queryOptions';
import { trackPortalEvent } from './storage';
import { DEFAULT_CATALOG_QUERY } from './types';

export const RESOURCE_CATALOG_PAGE_SIZE = 9;

export function queryFromRoute(
  route: RouteLocationNormalizedLoaded,
): CatalogQuery {
  const kind = String(route.query.kind || '');
  const availability = String(route.query.availability || '');
  const sort = String(route.query.sort || 'RELEVANCE');
  return {
    keyword: String(route.query.keyword || ''),
    kind: ['API', 'CONNECTOR', 'TABLE'].includes(kind)
      ? (kind as CatalogQuery['kind'])
      : '',
    tag: String(route.query.tag || ''),
    provider: String(route.query.provider || ''),
    availability: [
      'APPROVAL_REQUIRED',
      'AVAILABLE',
      'OFFLINE',
      'UNAVAILABLE',
    ].includes(availability)
      ? (availability as ResourceAvailability)
      : '',
    sort: ['NAME', 'RELEVANCE', 'UPDATED'].includes(sort)
      ? (sort as CatalogQuery['sort'])
      : 'RELEVANCE',
    page: Math.max(1, Number(route.query.page || 1)),
  };
}

export function filterCatalogItems(
  items: ResourceSummaryViewModel[],
  query: CatalogQuery,
  favorites: string[],
): ResourceSummaryViewModel[] {
  const keyword = query.keyword.trim().toLowerCase();
  const result = items.filter((item) => {
    const haystack = [item.name, item.description, item.provider, ...item.tags]
      .join(' ')
      .toLowerCase();
    return (
      (!keyword || haystack.includes(keyword)) &&
      (!query.kind || item.kind === query.kind) &&
      (!query.tag || item.tags.includes(query.tag)) &&
      (!query.provider || item.provider === query.provider) &&
      (!query.availability || item.availability === query.availability)
    );
  });
  if (query.sort === 'NAME') {
    return result.toSorted((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  }
  if (query.sort === 'UPDATED') {
    return result.toSorted(
      (a, b) =>
        new Date(b.updatedAt || 0).getTime() -
        new Date(a.updatedAt || 0).getTime(),
    );
  }
  return result.toSorted(
    (a, b) =>
      Number(favorites.includes(b.id)) - Number(favorites.includes(a.id)),
  );
}

export function useResourceCatalogPage(
  route: RouteLocationNormalizedLoaded,
  router: Router,
) {
  const { currentTenantId } = useTenant();
  const portal = usePortalStore();
  const { favorites, recents } = storeToRefs(portal);
  let querySyncTimer: ReturnType<typeof setTimeout> | undefined;

  const catalogQuery = useQuery(() =>
    resourceCatalogQueryOptions(currentTenantId.value || undefined),
  );
  const pendingQuery = useQuery(() =>
    pendingAccessRequestCountQueryOptions(currentCatalogUserId()),
  );

  const items = computed(() => catalogQuery.data.value?.items ?? []);
  const unavailableSources = computed(
    () => catalogQuery.data.value?.unavailableSources ?? [],
  );
  const pendingRequestCount = computed(() => pendingQuery.data.value ?? 0);
  const loading = computed(() => catalogQuery.isPending.value);
  const error = computed(() => catalogQuery.error.value);

  const query = reactive<CatalogQuery>({
    ...DEFAULT_CATALOG_QUERY,
    ...queryFromRoute(route),
  });

  watch(
    () => route.fullPath,
    () => Object.assign(query, queryFromRoute(route)),
  );

  watch(
    query,
    () => {
      clearTimeout(querySyncTimer);
      querySyncTimer = setTimeout(() => {
        const next: Record<string, string> = {};
        for (const key of ['embed', 'renderer']) {
          const value = route.query[key];
          if (typeof value === 'string' && value) next[key] = value;
        }
        Object.assign(
          next,
          Object.fromEntries(
            Object.entries(query)
              .filter(([, value]) => value !== '' && value !== 1)
              .map(([key, value]) => [key, String(value)]),
          ),
        );
        const current = Object.fromEntries(
          Object.entries(route.query).map(([key, value]) => [
            key,
            String(value),
          ]),
        );
        if (
          route.name === 'resource-catalog' &&
          JSON.stringify(next) !== JSON.stringify(current)
        ) {
          void router.replace({ name: 'resource-catalog', query: next });
        }
      }, 160);
    },
    { deep: true },
  );

  watch(
    () => [
      query.keyword,
      query.kind,
      query.tag,
      query.provider,
      query.availability,
    ],
    () => {
      query.page = 1;
    },
  );

  const filteredItems = computed(() =>
    filterCatalogItems(items.value, query, favorites.value),
  );

  const pageCount = computed(() =>
    Math.max(
      1,
      Math.ceil(filteredItems.value.length / RESOURCE_CATALOG_PAGE_SIZE),
    ),
  );

  const visibleItems = computed(() => {
    const start =
      (Math.min(query.page, pageCount.value) - 1) * RESOURCE_CATALOG_PAGE_SIZE;
    return filteredItems.value.slice(start, start + RESOURCE_CATALOG_PAGE_SIZE);
  });

  const recentItems = computed(() =>
    recents.value
      .map((id) => items.value.find((item) => item.id === id))
      .filter((item): item is ResourceSummaryViewModel => Boolean(item))
      .slice(0, 4),
  );

  function load(): void {
    void catalogQuery.refetch();
    void pendingQuery.refetch();
  }

  function openResource(resource: ResourceSummaryViewModel): void {
    trackPortalEvent('catalog_detail_opened', {
      resourceId: resource.id,
      kind: resource.kind,
    });
    void router.push(catalogDetailPath(resource.id));
  }

  function toggleFavorite(resource: ResourceSummaryViewModel): void {
    portal.toggleFavorite(resource.id);
  }

  onMounted(() => {
    trackPortalEvent('catalog_viewed');
  });

  onBeforeUnmount(() => clearTimeout(querySyncTimer));

  return {
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
  };
}
