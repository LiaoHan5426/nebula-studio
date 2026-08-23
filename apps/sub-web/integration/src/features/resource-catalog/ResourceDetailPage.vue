<script setup lang="ts">
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import {
  NebulaButton,
  NebulaDetailSection,
  NebulaEmptyState,
  NebulaPageHeader,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { useTenant } from '@/shared/composables/useTenant';
import { errorMessageKey, mapIntegrationErrorCode } from '@/shared/i18n/errors';
import { usePortalStore } from '@/shared/state/portalStore';
import { useQuery } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';

import { catalogApplyPath } from './catalog-routes';
import { toResourceDetail } from './mappers';
import { resourceCatalogQueryOptions } from './queryOptions';
import { resourceTypeRegistry } from './registry';
import { trackPortalEvent } from './storage';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { currentTenantId } = useTenant();
const portal = usePortalStore();
const { favorites } = storeToRefs(portal);

const catalogQuery = useQuery(() =>
  resourceCatalogQueryOptions(currentTenantId.value || undefined),
);

const resourceId = computed(() =>
  decodeURIComponent(String(route.params.resourceId)),
);

const match = computed(() =>
  catalogQuery.data.value?.items.find((item) => item.id === resourceId.value),
);

const resource = computed(() =>
  match.value ? toResourceDetail(match.value) : undefined,
);

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
  resource.value ? catalogApplyPath(resource.value.id) : '/catalog',
);

const missing = computed(
  () =>
    !catalogQuery.isPending.value && !catalogQuery.error.value && !match.value,
);

const loadError = computed(() => {
  if (catalogQuery.error.value) {
    return t(
      errorMessageKey(mapIntegrationErrorCode(catalogQuery.error.value)),
    );
  }
  if (missing.value) return t('catalog.detail.missing');
  return '';
});

watch(
  match,
  (item) => {
    if (!item) return;
    portal.recordRecent(item.id);
    trackPortalEvent('catalog_detail_viewed', {
      resourceId: item.id,
      kind: item.kind,
    });
  },
  { immediate: true },
);

function toggleFavorite(): void {
  if (!resource.value) return;
  portal.toggleFavorite(resource.value.id);
}
</script>

<template>
  <main class="detail-page">
    <div class="back-row">
      <button type="button" @click="router.push('/catalog')">
        {{ t('catalog.detail.back') }}
      </button>
    </div>
    <div
      v-if="catalogQuery.isPending"
      class="detail-loading"
      :aria-label="t('catalog.detail.loadingAria')"
    ></div>
    <NebulaEmptyState
      v-else-if="loadError || !resource || !definition"
      :title="t('catalog.detail.unavailable')"
      :description="loadError"
    >
      <NebulaButton @click="router.push('/catalog')">
        {{ t('catalog.backToCatalog') }}
      </NebulaButton>
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
              {{
                isFavorite
                  ? t('catalog.detail.favorited')
                  : t('catalog.detail.favorite')
              }}
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
        {{ t('catalog.detail.offline') }}
      </p>

      <div class="detail-layout">
        <div class="detail-main">
          <NebulaDetailSection
            :title="t('catalog.detail.purposeTitle')"
            :description="t('catalog.detail.purposeEyebrow')"
          >
            <p>{{ resource.purpose }}</p>
          </NebulaDetailSection>

          <NebulaDetailSection
            :title="t('catalog.detail.accessTitle', { kind: definition.label })"
            :description="t('catalog.detail.accessEyebrow')"
          >
            <dl class="domain-details">
              <div
                v-for="entry in definition.detailEntries(resource)"
                :key="entry.label"
              >
                <dt>{{ entry.label }}</dt>
                <dd :class="{ 'is-code': entry.code }">{{ entry.value }}</dd>
              </div>
            </dl>
          </NebulaDetailSection>

          <NebulaDetailSection
            v-if="resource.kind === 'API'"
            :title="t('catalog.detail.callExample')"
            description="Quick start"
          >
            <pre><code>curl -X {{ resource.detail.method || 'GET' }} \
  "{{ resource.detail.endpointUri || '/gateway/resource' }}" \
  -H "Authorization: Bearer &lt;token&gt;"</code></pre>
          </NebulaDetailSection>

          <NebulaDetailSection
            v-else-if="resource.kind === 'TABLE'"
            :title="t('catalog.detail.subscribeTitle')"
            :description="t('catalog.detail.dataEyebrow')"
          >
            <p>{{ t('catalog.detail.subscribeBody') }}</p>
          </NebulaDetailSection>

          <NebulaDetailSection
            v-else
            :title="t('catalog.detail.schemaTitle')"
            :description="t('catalog.detail.schemaEyebrow')"
          >
            <p>{{ t('catalog.detail.schemaBody') }}</p>
          </NebulaDetailSection>
        </div>

        <aside class="detail-aside">
          <NebulaDetailSection
            :title="t('catalog.detail.governance')"
            :divided="false"
          >
            <dl>
              <div>
                <dt>{{ t('catalog.detail.owner') }}</dt>
                <dd>{{ resource.owner }}</dd>
              </div>
              <div>
                <dt>{{ t('catalog.detail.sla') }}</dt>
                <dd>{{ resource.sla }}</dd>
              </div>
              <div>
                <dt>{{ t('catalog.detail.scope') }}</dt>
                <dd>{{ resource.permissionScope }}</dd>
              </div>
              <div>
                <dt>{{ t('catalog.detail.compat') }}</dt>
                <dd>
                  {{ resource.compatibility.join(t('catalog.sourceJoin')) }}
                </dd>
              </div>
            </dl>
          </NebulaDetailSection>
          <NebulaButton v-if="canApply" @click="router.push(applyPath)">
            {{ t('catalog.detail.startApply') }}
          </NebulaButton>
          <NebulaButton
            v-else
            variant="outline"
            @click="router.push('/catalog')"
          >
            {{ t('catalog.detail.findAlt') }}
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
  background: hsl(var(--primary));
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
