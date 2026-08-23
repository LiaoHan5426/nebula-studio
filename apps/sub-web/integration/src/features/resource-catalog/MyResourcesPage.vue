<script setup lang="ts">
import type { SubscriptionRequestRecord } from '@/features/subscription/api';

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import {
  NebulaButton,
  NebulaEmptyState,
  NebulaPageHeader,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { subscriptionsQueryOptions } from '@/features/subscriptions/queryOptions';
import { getAuthUserId } from '@/shared/auth/session';
import { useTenant } from '@/shared/composables/useTenant';
import { errorMessageKey, mapIntegrationErrorCode } from '@/shared/i18n/errors';
import { useQuery } from '@tanstack/vue-query';

import { normalizeRequestStatus } from './mappers';
import {
  accessRequestsByUserQueryOptions,
  currentCatalogUserId,
} from './queryOptions';
import { trackPortalEvent } from './storage';

const { t } = useI18n();
const router = useRouter();
const { currentTenantId } = useTenant();
const activeTab = ref<'ACCESS' | 'SUBSCRIPTIONS'>('ACCESS');
const userId = currentCatalogUserId();

const requestsQuery = useQuery(() => accessRequestsByUserQueryOptions(userId));
const subscriptionsQuery = useQuery(() =>
  subscriptionsQueryOptions(currentTenantId.value || undefined),
);

const requests = computed(() => requestsQuery.data.value ?? []);
const subscriptions = computed(() => subscriptionsQuery.data.value ?? []);
const loading = computed(
  () => requestsQuery.isPending.value || subscriptionsQuery.isPending.value,
);
const error = computed(() => {
  if (!getAuthUserId()) return t('errors.unauthorized');
  const cause = requestsQuery.error.value && subscriptionsQuery.error.value;
  return cause ? t(errorMessageKey(mapIntegrationErrorCode(cause))) : '';
});

const approvedRequests = computed(() =>
  requests.value.filter(
    (request) => normalizeRequestStatus(request.status) === 'APPROVED',
  ),
);

function load(): void {
  void requestsQuery.refetch();
  void subscriptionsQuery.refetch();
}

function resourceName(request: SubscriptionRequestRecord): string {
  return String(
    request.requestConfig?.resourceName ||
      request.interfaceId ||
      t('portal.resources.fallbackName'),
  );
}

function accessKind(request: SubscriptionRequestRecord): string {
  return String(
    request.requestConfig?.resourceKind ||
      request.requestType.replace('ACCESS_', ''),
  );
}

function accessEndpoint(request: SubscriptionRequestRecord): string {
  return accessKind(request) === 'API'
    ? `/gateway/${currentTenantId.value || '{tenant}'}/${request.interfaceId}`
    : accessKind(request) === 'CONNECTOR'
      ? `connector://${request.interfaceId}`
      : `subscription://${request.interfaceId}`;
}

function markFirstAccess(request: SubscriptionRequestRecord): void {
  trackPortalEvent('approved_resource_first_access', {
    requestId: request.requestId,
    resourceId: request.interfaceId,
  });
}
</script>

<template>
  <main class="resources-page">
    <NebulaPageHeader
      :eyebrow="t('portal.resources.eyebrow')"
      :title="t('portal.resources.title')"
      :description="t('portal.resources.description')"
    >
      <template #actions>
        <NebulaButton variant="outline" @click="router.push('/my-requests')">
          {{ t('portal.resources.myRequests') }}
        </NebulaButton>
        <NebulaButton @click="router.push('/catalog')">
          {{ t('portal.resources.discover') }}
        </NebulaButton>
      </template>
    </NebulaPageHeader>

    <div
      class="resource-tabs"
      role="tablist"
      :aria-label="t('portal.resources.tabsAria')"
    >
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'ACCESS'"
        :class="{ active: activeTab === 'ACCESS' }"
        @click="activeTab = 'ACCESS'"
      >
        {{ t('portal.resources.tabAccess') }}
        <span>{{ approvedRequests.length }}</span>
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'SUBSCRIPTIONS'"
        :class="{ active: activeTab === 'SUBSCRIPTIONS' }"
        @click="activeTab = 'SUBSCRIPTIONS'"
      >
        {{ t('portal.resources.tabSubscriptions') }}
        <span>{{ subscriptions.length }}</span>
      </button>
    </div>

    <div v-if="loading" class="owned-grid">
      <div v-for="index in 4" :key="index" class="owned-skeleton"></div>
    </div>
    <NebulaEmptyState
      v-else-if="error"
      :title="t('portal.resources.loadFailed')"
      :description="error"
    >
      <NebulaButton @click="load">{{ t('common.reload') }}</NebulaButton>
    </NebulaEmptyState>
    <template v-else-if="activeTab === 'ACCESS'">
      <NebulaEmptyState
        v-if="approvedRequests.length === 0"
        :title="t('portal.resources.emptyAccessTitle')"
        :description="t('portal.resources.emptyAccessBody')"
      >
        <NebulaButton @click="router.push('/catalog')">
          {{ t('catalog.browseTitle') }}
        </NebulaButton>
      </NebulaEmptyState>
      <section v-else class="owned-grid">
        <article
          v-for="request in approvedRequests"
          :key="request.requestId"
          class="owned-card"
        >
          <header>
            <div>
              <span class="kind">{{ accessKind(request) }}</span>
              <h2>{{ resourceName(request) }}</h2>
            </div>
            <NebulaTag>{{ t('portal.resources.credentialOk') }}</NebulaTag>
          </header>
          <dl>
            <div>
              <dt>{{ t('portal.resources.endpoint') }}</dt>
              <dd>
                <code>{{ accessEndpoint(request) }}</code>
              </dd>
            </div>
            <div>
              <dt>{{ t('portal.resources.auth') }}</dt>
              <dd>{{ t('portal.resources.authValue') }}</dd>
            </div>
            <div>
              <dt>{{ t('portal.resources.environment') }}</dt>
              <dd>
                {{
                  request.requestConfig?.environment ||
                  t('portal.resources.envFallback')
                }}
              </dd>
            </div>
          </dl>
          <footer>
            <NebulaButton size="sm" @click="markFirstAccess(request)">
              {{ t('portal.resources.openGuide') }}
            </NebulaButton>
            <NebulaButton
              size="sm"
              variant="outline"
              @click="router.push('/catalog')"
            >
              {{ t('portal.resources.renew') }}
            </NebulaButton>
          </footer>
        </article>
      </section>
    </template>
    <template v-else>
      <NebulaEmptyState
        v-if="subscriptions.length === 0"
        :title="t('portal.resources.emptySubTitle')"
        :description="t('portal.resources.emptySubBody')"
      >
        <NebulaButton @click="router.push('/catalog?kind=TABLE')">
          {{ t('portal.resources.findTables') }}
        </NebulaButton>
      </NebulaEmptyState>
      <section v-else class="owned-grid">
        <article
          v-for="subscription in subscriptions"
          :key="subscription.subscriptionId"
          class="owned-card"
        >
          <header>
            <div>
              <span class="kind">TABLE</span>
              <h2>{{ subscription.tableName }}</h2>
            </div>
            <NebulaTag>{{ subscription.status }}</NebulaTag>
          </header>
          <dl>
            <div>
              <dt>{{ t('portal.resources.dataSource') }}</dt>
              <dd>{{ subscription.dataSourceId }}</dd>
            </div>
            <div>
              <dt>{{ t('portal.resources.subscribeType') }}</dt>
              <dd>{{ subscription.subscribeType }}</dd>
            </div>
            <div>
              <dt>{{ t('portal.resources.events') }}</dt>
              <dd>
                {{
                  subscription.config.eventTypes.join(t('catalog.sourceJoin'))
                }}
              </dd>
            </div>
          </dl>
          <footer>
            <NebulaButton size="sm" @click="router.push('/subscriptions')">
              {{ t('portal.resources.viewEvents') }}
            </NebulaButton>
            <NebulaButton
              size="sm"
              variant="outline"
              @click="router.push('/subscriptions')"
            >
              {{ t('portal.resources.manageSub') }}
            </NebulaButton>
          </footer>
        </article>
      </section>
    </template>
  </main>
</template>

<style scoped>
.resources-page {
  display: grid;
  gap: var(--space-5);
  max-width: 1120px;
  padding: var(--space-6);
  margin: 0 auto;
}

.resource-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: hsl(var(--muted) / 60%);
  border-radius: var(--radius-md);
}

.resource-tabs button {
  flex: 1;
  padding: 10px 14px;
  font: inherit;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: calc(var(--radius-md) - 3px);
}

.resource-tabs button.active {
  font-weight: 700;
  color: hsl(var(--foreground));
  background: hsl(var(--card));
  box-shadow: 0 2px 8px hsl(var(--foreground) / 8%);
}

.resource-tabs span {
  margin-left: 5px;
  color: hsl(var(--primary));
}

.owned-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.owned-card {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-5);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
}

.owned-card header,
.owned-card footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
}

.kind {
  font-size: 11px;
  font-weight: 800;
  color: hsl(var(--primary));
  letter-spacing: 0.08em;
}

.owned-card h2 {
  margin: 5px 0 0;
  font-size: 18px;
}

.owned-card dl {
  display: grid;
  margin: 0;
}

.owned-card dl div {
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr);
  gap: var(--space-3);
  padding: 10px 0;
  border-bottom: 1px solid hsl(var(--border));
}

.owned-card dt {
  color: hsl(var(--muted-foreground));
}

.owned-card dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
}

.owned-card code {
  font-size: 12px;
}

.owned-skeleton {
  min-height: 260px;
  background: hsl(var(--muted) / 45%);
  border-radius: var(--radius-lg);
}

@media (width <= 720px) {
  .resources-page {
    padding: var(--space-4);
  }

  .owned-grid {
    grid-template-columns: 1fr;
  }
}
</style>
