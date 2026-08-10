<script setup lang="ts">
import type { ResourceDetailViewModel } from './types';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  NebulaButton,
  NebulaEmptyState,
  NebulaPageHeader,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { useTenant } from '@/shared/composables/useTenant';

import { loadResourceCatalog } from './api';
import { toResourceDetail } from './mappers';
import { resourceTypeRegistry } from './registry';
import {
  favoriteResourceIds,
  recordRecentResource,
  toggleFavoriteResource,
  trackPortalEvent,
} from './storage';

const route = useRoute();
const router = useRouter();
const { currentTenantId } = useTenant();
const loading = ref(true);
const error = ref('');
const resource = ref<ResourceDetailViewModel>();
const favorites = ref(favoriteResourceIds());

const definition = computed(() =>
  resource.value ? resourceTypeRegistry[resource.value.kind] : undefined,
);
const canApply = computed(
  () =>
    resource.value?.availability === 'AVAILABLE' ||
    resource.value?.availability === 'APPROVAL_REQUIRED',
);
const isFavorite = computed(() =>
  resource.value ? favorites.value.includes(resource.value.id) : false,
);
const applyPath = computed(() =>
  resource.value ? `/catalog/${resource.value.id}/apply` : '/catalog',
);

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const result = await loadResourceCatalog(
      currentTenantId.value || undefined,
    );
    const id = decodeURIComponent(String(route.params.resourceId));
    const match = result.items.find((item) => item.id === id);
    if (!match) {
      error.value = '该资源不存在、已下线，或你当前无权查看。';
      return;
    }
    resource.value = toResourceDetail(match);
    recordRecentResource(match);
    trackPortalEvent('catalog_detail_viewed', {
      resourceId: match.id,
      kind: match.kind,
    });
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : '资源详情暂时无法加载。';
  } finally {
    loading.value = false;
  }
}

function toggleFavorite(): void {
  if (!resource.value) return;
  favorites.value = toggleFavoriteResource(resource.value.id);
}

onMounted(load);
</script>

<template>
  <main class="detail-page">
    <div class="back-row">
      <button type="button" @click="router.push('/catalog')">
        ← 返回资源目录
      </button>
    </div>
    <div
      v-if="loading"
      class="detail-loading"
      aria-label="正在加载资源详情"
    ></div>
    <NebulaEmptyState
      v-else-if="error || !resource || !definition"
      title="无法打开资源"
      :description="error"
    >
      <NebulaButton @click="router.push('/catalog')">返回目录</NebulaButton>
    </NebulaEmptyState>
    <template v-else>
      <section class="detail-hero">
        <div class="detail-mark">{{ definition.accent }}</div>
        <NebulaPageHeader
          :eyebrow="`${definition.label} · ${resource.provider}`"
          :title="resource.name"
          :description="resource.description"
        >
          <template #actions>
            <NebulaButton variant="outline" @click="toggleFavorite">
              {{ isFavorite ? '★ 已收藏' : '☆ 收藏' }}
            </NebulaButton>
            <NebulaButton v-if="canApply" @click="router.push(applyPath)">
              {{ definition.applyLabel }}
            </NebulaButton>
          </template>
        </NebulaPageHeader>
        <div class="detail-tags">
          <NebulaTag>{{ resource.version }}</NebulaTag>
          <NebulaTag>{{ resource.permissionScope }}</NebulaTag>
          <NebulaTag v-for="tag in resource.tags" :key="tag">
            {{ tag }}
          </NebulaTag>
        </div>
      </section>

      <p v-if="!canApply" class="offline-banner" role="status">
        此资源当前不可申请。你可以返回目录选择同类型的在线资源。
      </p>

      <div class="detail-layout">
        <div class="detail-main">
          <section class="detail-section">
            <span class="section-eyebrow">适用场景</span>
            <h2>这项资源可以做什么</h2>
            <p>{{ resource.purpose }}</p>
          </section>

          <section class="detail-section">
            <span class="section-eyebrow">接入信息</span>
            <h2>{{ definition.label }} 详情</h2>
            <dl class="domain-details">
              <div
                v-for="entry in definition.detailEntries(resource)"
                :key="entry.label"
              >
                <dt>{{ entry.label }}</dt>
                <dd :class="{ 'is-code': entry.code }">{{ entry.value }}</dd>
              </div>
            </dl>
          </section>

          <section v-if="resource.kind === 'API'" class="detail-section">
            <span class="section-eyebrow">Quick start</span>
            <h2>调用示例</h2>
            <pre><code>curl -X {{ resource.detail.method || 'GET' }} \
  "{{ resource.detail.endpointUri || '/gateway/resource' }}" \
  -H "Authorization: Bearer &lt;token&gt;"</code></pre>
          </section>

          <section v-else-if="resource.kind === 'TABLE'" class="detail-section">
            <span class="section-eyebrow">数据范围</span>
            <h2>订阅方式</h2>
            <p>
              支持按申请范围使用 CDC
              或轮询方式订阅。字段范围与敏感数据策略将在审批后给出。
            </p>
          </section>

          <section v-else class="detail-section">
            <span class="section-eyebrow">配置模型</span>
            <h2>Schema 驱动配置</h2>
            <p>
              连接配置由插件目录中的 configSchema
              生成，审批通过后无需手写平台内部参数。
            </p>
          </section>
        </div>

        <aside class="detail-aside">
          <h2>治理信息</h2>
          <dl>
            <div>
              <dt>负责人</dt>
              <dd>{{ resource.owner }}</dd>
            </div>
            <div>
              <dt>服务等级</dt>
              <dd>{{ resource.sla }}</dd>
            </div>
            <div>
              <dt>权限范围</dt>
              <dd>{{ resource.permissionScope }}</dd>
            </div>
            <div>
              <dt>兼容性</dt>
              <dd>{{ resource.compatibility.join('、') }}</dd>
            </div>
          </dl>
          <NebulaButton v-if="canApply" @click="router.push(applyPath)">
            开始申请
          </NebulaButton>
          <NebulaButton
            v-else
            variant="outline"
            @click="router.push('/catalog')"
          >
            查找替代资源
          </NebulaButton>
        </aside>
      </div>
    </template>
  </main>
</template>

<style scoped>
.detail-page {
  display: grid;
  gap: var(--space-5);
  max-width: 1180px;
  padding: var(--space-6);
  margin: 0 auto;
}

.back-row button {
  padding: 0;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: none;
  border: 0;
}

.detail-loading {
  min-height: 500px;
  background: hsl(var(--muted) / 45%);
  border-radius: var(--radius-lg);
}

.detail-hero {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: var(--space-5);
  padding: clamp(24px, 4vw, 44px);
  background:
    radial-gradient(
      circle at 100% 0%,
      hsl(var(--primary) / 18%),
      transparent 35%
    ),
    hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius-lg) + 8px);
}

.detail-mark {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  font-size: 13px;
  font-weight: 900;
  color: hsl(var(--primary-foreground));
  background: linear-gradient(145deg, hsl(var(--primary)), #7c5cff);
  border-radius: 20px;
  box-shadow: 0 14px 30px hsl(var(--primary) / 25%);
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  grid-column: 2;
  gap: 7px;
}

.offline-banner {
  padding: var(--space-4);
  margin: 0;
  background: hsl(var(--destructive) / 10%);
  border-radius: var(--radius-md);
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: var(--space-5);
  align-items: start;
}

.detail-main {
  display: grid;
  gap: var(--space-4);
}

.detail-section,
.detail-aside {
  padding: var(--space-5);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
}

.detail-section h2,
.detail-aside h2 {
  margin: 5px 0 var(--space-3);
  font-size: 19px;
}

.detail-section p {
  line-height: 1.75;
  color: hsl(var(--muted-foreground));
}

.section-eyebrow {
  font-size: 11px;
  font-weight: 800;
  color: hsl(var(--primary));
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.domain-details,
.detail-aside dl {
  display: grid;
  gap: 0;
  margin: 0;
}

.domain-details div,
.detail-aside dl div {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  gap: var(--space-3);
  padding: 12px 0;
  border-bottom: 1px solid hsl(var(--border));
}

dt {
  color: hsl(var(--muted-foreground));
}

dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
}

.is-code,
pre {
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
}

pre {
  padding: var(--space-4);
  overflow: auto;
  color: hsl(var(--foreground));
  background: hsl(var(--muted) / 60%);
  border-radius: var(--radius-md);
}

.detail-aside {
  position: sticky;
  top: var(--space-4);
}

.detail-aside > :deep(button) {
  width: 100%;
  margin-top: var(--space-4);
}

@media (width <= 820px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .detail-aside {
    position: static;
  }
}

@media (width <= 620px) {
  .detail-page {
    padding: var(--space-4);
  }

  .detail-hero {
    grid-template-columns: 1fr;
  }

  .detail-tags {
    grid-column: 1;
  }
}
</style>
