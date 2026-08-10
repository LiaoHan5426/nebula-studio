<script setup lang="ts">
import type {
  CatalogQuery,
  ResourceAvailability,
  ResourceKind,
  ResourceSummaryViewModel,
} from './types';

import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  NebulaButton,
  NebulaEmptyState,
  NebulaInput,
  NebulaPageHeader,
  NebulaSelect,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { subscriptionRequestApi } from '@/features/subscription/api';
import { getAuthUserId } from '@/shared/auth/session';
import { useTenant } from '@/shared/composables/useTenant';
import { isApiSuccess } from '@/shared/types';

import { loadResourceCatalog } from './api';
import { resourceTypeRegistry } from './registry';
import {
  favoriteResourceIds,
  recentResourceIds,
  toggleFavoriteResource,
  trackPortalEvent,
} from './storage';
import { DEFAULT_CATALOG_QUERY } from './types';

const PAGE_SIZE = 9;
const route = useRoute();
const router = useRouter();
const { currentTenantId } = useTenant();

const items = ref<ResourceSummaryViewModel[]>([]);
const loading = ref(true);
const error = ref('');
const unavailableSources = ref<string[]>([]);
const pendingRequestCount = ref(0);
const favorites = ref(favoriteResourceIds());
const recents = ref(recentResourceIds());
let querySyncTimer: ReturnType<typeof setTimeout> | undefined;

function queryFromRoute(): CatalogQuery {
  const kind = String(route.query.kind || '');
  const availability = String(route.query.availability || '');
  const sort = String(route.query.sort || 'RELEVANCE');
  return {
    keyword: String(route.query.keyword || ''),
    kind: ['API', 'CONNECTOR', 'TABLE'].includes(kind)
      ? (kind as ResourceKind)
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

const query = reactive<CatalogQuery>({
  ...DEFAULT_CATALOG_QUERY,
  ...queryFromRoute(),
});

watch(
  () => route.fullPath,
  () => Object.assign(query, queryFromRoute()),
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
        Object.entries(route.query).map(([key, value]) => [key, String(value)]),
      );
      if (JSON.stringify(next) !== JSON.stringify(current)) {
        void router.replace({ query: next });
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

const providers = computed(() => [
  { label: '全部提供方', value: '' },
  ...Array.from(new Set(items.value.map((item) => item.provider)))
    .toSorted()
    .map((value) => ({ label: value, value })),
]);
const tags = computed(() => [
  { label: '全部标签', value: '' },
  ...Array.from(new Set(items.value.flatMap((item) => item.tags)))
    .toSorted()
    .map((value) => ({ label: value, value })),
]);

const filteredItems = computed(() => {
  const keyword = query.keyword.trim().toLowerCase();
  const result = items.value.filter((item) => {
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
      Number(favorites.value.includes(b.id)) -
      Number(favorites.value.includes(a.id)),
  );
});

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredItems.value.length / PAGE_SIZE)),
);
const visibleItems = computed(() => {
  const start = (Math.min(query.page, pageCount.value) - 1) * PAGE_SIZE;
  return filteredItems.value.slice(start, start + PAGE_SIZE);
});
const recentItems = computed(() =>
  recents.value
    .map((id) => items.value.find((item) => item.id === id))
    .filter((item): item is ResourceSummaryViewModel => Boolean(item))
    .slice(0, 4),
);

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const result = await loadResourceCatalog(
      currentTenantId.value || undefined,
    );
    items.value = result.items;
    unavailableSources.value = result.unavailableSources;
    const userId = getAuthUserId();
    if (userId) {
      try {
        const requestResponse = await subscriptionRequestApi.listByUser(userId);
        if (isApiSuccess(requestResponse)) {
          pendingRequestCount.value = requestResponse.data.filter((request) =>
            ['NEEDS_INFO', 'PENDING', 'PENDING_REVIEW'].includes(
              request.status,
            ),
          ).length;
        }
      } catch {
        // Progress summary is optional and must not block catalog discovery.
      }
    }
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : '资源目录暂时无法加载。';
  } finally {
    loading.value = false;
  }
}

function openResource(resource: ResourceSummaryViewModel): void {
  trackPortalEvent('catalog_detail_opened', {
    resourceId: resource.id,
    kind: resource.kind,
  });
  void router.push({
    name: 'resource-detail',
    params: { resourceId: resource.id },
  });
}

function toggleFavorite(resource: ResourceSummaryViewModel): void {
  favorites.value = toggleFavoriteResource(resource.id);
}

function availabilityLabel(value: ResourceAvailability): string {
  return {
    AVAILABLE: '可直接使用',
    APPROVAL_REQUIRED: '需申请',
    UNAVAILABLE: '暂不可申请',
    OFFLINE: '已下线',
  }[value];
}

onMounted(() => {
  trackPortalEvent('catalog_viewed');
  void load();
});

onBeforeUnmount(() => clearTimeout(querySyncTimer));
</script>

<template>
  <main class="portal-page">
    <section class="catalog-hero">
      <NebulaPageHeader
        eyebrow="Resource portal"
        title="找到下一项可复用能力"
        description="从 API、数据表与 Connector 中查找经过组织治理的资源，了解用途后直接发起访问申请。"
      >
        <template #actions>
          <NebulaButton variant="outline" @click="router.push('/my-requests')">
            查看申请进度
          </NebulaButton>
          <NebulaButton @click="router.push('/my-resources')">
            我的资源
          </NebulaButton>
        </template>
      </NebulaPageHeader>
      <label class="hero-search">
        <span>搜索资源</span>
        <NebulaInput
          v-model="query.keyword"
          placeholder="搜索名称、用途、标签或提供方"
          aria-label="搜索资源"
        />
      </label>
      <div class="hero-stats">
        <span><strong>{{ items.length }}</strong> 项可发现资源</span>
        <span><strong>{{ favorites.length }}</strong> 项收藏</span>
        <span><strong>{{ recentItems.length }}</strong> 项最近访问</span>
        <span><strong>{{ pendingRequestCount }}</strong> 项申请待处理</span>
      </div>
    </section>

    <section v-if="recentItems.length" class="recent-strip">
      <div>
        <span class="section-eyebrow">继续探索</span>
        <h2>最近访问</h2>
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
          <span class="section-eyebrow">统一目录</span>
          <h2>浏览全部资源</h2>
        </div>
        <p>{{ filteredItems.length }} 项匹配结果</p>
      </div>

      <div class="filters" aria-label="目录筛选">
        <NebulaSelect
          v-model="query.kind"
          :options="[
            { label: '全部类型', value: '' },
            { label: 'API 服务', value: 'API' },
            { label: '数据表', value: 'TABLE' },
            { label: 'Connector', value: 'CONNECTOR' },
          ]"
          aria-label="资源类型"
        />
        <NebulaSelect
          v-model="query.provider"
          :options="providers"
          aria-label="资源提供方"
        />
        <NebulaSelect
          v-model="query.tag"
          :options="tags"
          aria-label="资源标签"
        />
        <NebulaSelect
          v-model="query.availability"
          :options="[
            { label: '全部申请状态', value: '' },
            { label: '可直接使用', value: 'AVAILABLE' },
            { label: '需申请', value: 'APPROVAL_REQUIRED' },
            { label: '暂不可申请', value: 'UNAVAILABLE' },
            { label: '已下线', value: 'OFFLINE' },
          ]"
          aria-label="可申请状态"
        />
        <NebulaSelect
          v-model="query.sort"
          :options="[
            { label: '推荐排序', value: 'RELEVANCE' },
            { label: '最近更新', value: 'UPDATED' },
            { label: '名称排序', value: 'NAME' },
          ]"
          aria-label="排序方式"
        />
        <NebulaButton
          variant="outline"
          @click="Object.assign(query, DEFAULT_CATALOG_QUERY)"
        >
          清除筛选
        </NebulaButton>
      </div>

      <p v-if="unavailableSources.length" class="partial-notice" role="status">
        {{ unavailableSources.join('、') }} 暂不可用，当前展示其余目录数据。
        <button type="button" @click="load">重新加载</button>
      </p>

      <div v-if="loading" class="resource-grid" aria-label="正在加载资源">
        <div v-for="index in 6" :key="index" class="resource-skeleton"></div>
      </div>
      <NebulaEmptyState
        v-else-if="error"
        title="资源目录加载失败"
        :description="error"
      >
        <NebulaButton @click="load">重新加载</NebulaButton>
      </NebulaEmptyState>
      <NebulaEmptyState
        v-else-if="visibleItems.length === 0"
        title="没有找到匹配资源"
        description="尝试缩短关键词或清除部分筛选条件。"
      >
        <NebulaButton @click="Object.assign(query, DEFAULT_CATALOG_QUERY)">
          清除筛选
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
                favorites.includes(resource.id) ? '取消收藏' : '收藏资源'
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
              查看详情
            </NebulaButton>
          </div>
        </article>
      </div>

      <nav v-if="pageCount > 1" class="pagination" aria-label="目录分页">
        <NebulaButton
          variant="outline"
          :disabled="query.page <= 1"
          @click="query.page -= 1"
        >
          上一页
        </NebulaButton>
        <span>第 {{ query.page }} / {{ pageCount }} 页</span>
        <NebulaButton
          variant="outline"
          :disabled="query.page >= pageCount"
          @click="query.page += 1"
        >
          下一页
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
