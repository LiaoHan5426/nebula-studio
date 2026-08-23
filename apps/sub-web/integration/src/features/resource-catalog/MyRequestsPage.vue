<script setup lang="ts">
import type { SubscriptionRequestRecord } from '@/features/subscription/api';

import type { AccessRequestStatus } from './types';

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import {
  NebulaButton,
  NebulaEmptyState,
  NebulaPageHeader,
  NebulaSelect,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { getAuthUserId } from '@/shared/auth/session';
import { errorMessageKey, mapIntegrationErrorCode } from '@/shared/i18n/errors';
import { isApiSuccess } from '@/shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

import { normalizeRequestStatus } from './mappers';
import {
  accessRequestsByUserQueryKey,
  accessRequestsByUserQueryOptions,
  cancelAccessRequestMutationOptions,
  currentCatalogUserId,
} from './queryOptions';

const { t } = useI18n();
const router = useRouter();
const queryClient = useQueryClient();
const status = ref('');
const cancellingId = ref('');
const userId = currentCatalogUserId();

const requestsQuery = useQuery(() => accessRequestsByUserQueryOptions(userId));
const cancelMutation = useMutation(cancelAccessRequestMutationOptions());

const requests = computed(() => requestsQuery.data.value ?? []);
const loading = computed(() => requestsQuery.isPending.value);
const error = computed(() => {
  if (!getAuthUserId()) return t('errors.unauthorized');
  if (!requestsQuery.error.value) return '';
  return t(errorMessageKey(mapIntegrationErrorCode(requestsQuery.error.value)));
});

const visibleRequests = computed(() =>
  requests.value.filter(
    (request) =>
      !status.value || normalizeRequestStatus(request.status) === status.value,
  ),
);

function load(): void {
  void requestsQuery.refetch();
}

async function cancel(request: SubscriptionRequestRecord): Promise<void> {
  cancellingId.value = request.requestId;
  try {
    const response = await cancelMutation.mutateAsync(request.requestId);
    if (isApiSuccess(response)) {
      await queryClient.invalidateQueries({
        queryKey: accessRequestsByUserQueryKey(userId),
      });
    }
  } finally {
    cancellingId.value = '';
  }
}

function resourceName(request: SubscriptionRequestRecord): string {
  return String(
    request.requestConfig?.resourceName ||
      request.interfaceId ||
      t('portal.requests.fallbackName'),
  );
}

function statusCopy(value: AccessRequestStatus): {
  action: string;
  description: string;
  label: string;
} {
  return {
    label: t(`portal.requests.status.${value}.label`),
    description: t(`portal.requests.status.${value}.description`),
    action: t(`portal.requests.status.${value}.action`),
  };
}

function nextAction(
  request: SubscriptionRequestRecord,
  value: AccessRequestStatus,
): void {
  if (value === 'PENDING') {
    void cancel(request);
    return;
  }
  if (value === 'APPROVED') {
    void router.push('/my-resources');
    return;
  }
  void router.push('/catalog');
}
</script>

<template>
  <main class="requests-page">
    <NebulaPageHeader
      :eyebrow="t('portal.requests.eyebrow')"
      :title="t('portal.requests.title')"
      :description="t('portal.requests.description')"
    >
      <template #actions>
        <NebulaButton variant="outline" @click="router.push('/catalog')">
          {{ t('portal.requests.browse') }}
        </NebulaButton>
        <NebulaButton @click="router.push('/my-resources')">
          {{ t('portal.resources.title') }}
        </NebulaButton>
      </template>
    </NebulaPageHeader>

    <div class="requests-toolbar">
      <NebulaSelect
        v-model="status"
        :options="[
          { label: t('portal.requests.filter.all'), value: '' },
          {
            label: t('portal.requests.status.NEEDS_INFO.label'),
            value: 'NEEDS_INFO',
          },
          {
            label: t('portal.requests.status.PENDING.label'),
            value: 'PENDING',
          },
          {
            label: t('portal.requests.status.APPROVED.label'),
            value: 'APPROVED',
          },
          {
            label: t('portal.requests.status.REJECTED.label'),
            value: 'REJECTED',
          },
          {
            label: t('portal.requests.status.EXPIRED.label'),
            value: 'EXPIRED',
          },
        ]"
        :aria-label="t('portal.requests.filterAria')"
      />
      <span>{{
        t('portal.requests.count', { n: visibleRequests.length })
      }}</span>
    </div>

    <div v-if="loading" class="request-list">
      <div v-for="index in 3" :key="index" class="request-skeleton"></div>
    </div>
    <NebulaEmptyState
      v-else-if="error"
      :title="t('portal.requests.loadFailed')"
      :description="error"
    >
      <NebulaButton @click="load">{{ t('common.reload') }}</NebulaButton>
    </NebulaEmptyState>
    <NebulaEmptyState
      v-else-if="visibleRequests.length === 0"
      :title="t('portal.requests.emptyTitle')"
      :description="t('portal.requests.emptyBody')"
    >
      <NebulaButton @click="router.push('/catalog')">
        {{ t('catalog.browseTitle') }}
      </NebulaButton>
    </NebulaEmptyState>
    <section
      v-else
      class="request-list"
      :aria-label="t('portal.requests.timelineAria')"
    >
      <article
        v-for="request in visibleRequests"
        :key="request.requestId"
        class="request-item"
      >
        <div
          class="timeline-dot"
          :data-status="normalizeRequestStatus(request.status)"
        ></div>
        <div class="request-content">
          <div class="request-heading">
            <div>
              <span>{{ request.requestType.replace('ACCESS_', '') }}</span>
              <h2>{{ resourceName(request) }}</h2>
            </div>
            <NebulaTag>
              {{ statusCopy(normalizeRequestStatus(request.status)).label }}
            </NebulaTag>
          </div>
          <p>
            {{ statusCopy(normalizeRequestStatus(request.status)).description }}
          </p>
          <blockquote v-if="request.reason">{{ request.reason }}</blockquote>
          <footer>
            <span>
              {{ request.createdAt || t('portal.requests.timePending') }} ·
              {{ request.requestId }}
            </span>
            <NebulaButton
              size="sm"
              :variant="
                normalizeRequestStatus(request.status) === 'PENDING'
                  ? 'outline'
                  : 'primary'
              "
              :disabled="cancellingId === request.requestId"
              @click="
                nextAction(request, normalizeRequestStatus(request.status))
              "
            >
              {{
                cancellingId === request.requestId
                  ? t('portal.requests.cancelling')
                  : statusCopy(normalizeRequestStatus(request.status)).action
              }}
            </NebulaButton>
          </footer>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.requests-page {
  display: grid;
  gap: var(--space-5);
  max-width: 1060px;
  padding: var(--space-6);
  margin: 0 auto;
}

.requests-toolbar,
.request-heading,
.request-item footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
}

.requests-toolbar {
  padding: var(--space-3);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
}

.requests-toolbar span {
  color: hsl(var(--muted-foreground));
}

.request-list {
  display: grid;
  gap: var(--space-3);
}

.request-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: var(--space-4);
  padding: var(--space-5);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
}

.timeline-dot {
  width: 12px;
  height: 12px;
  margin-top: 6px;
  background: hsl(var(--muted-foreground));
  border: 3px solid hsl(var(--background));
  border-radius: 50%;
  box-shadow: 0 0 0 2px hsl(var(--muted-foreground));
}

.timeline-dot[data-status='APPROVED'] {
  background: hsl(var(--success, 145 60% 40%));
  box-shadow: 0 0 0 2px hsl(var(--success, 145 60% 40%));
}

.timeline-dot[data-status='REJECTED'],
.timeline-dot[data-status='EXPIRED'] {
  background: hsl(var(--destructive));
  box-shadow: 0 0 0 2px hsl(var(--destructive));
}

.timeline-dot[data-status='PENDING'],
.timeline-dot[data-status='NEEDS_INFO'] {
  background: hsl(var(--primary));
  box-shadow: 0 0 0 2px hsl(var(--primary));
}

.request-content {
  display: grid;
  gap: var(--space-3);
}

.request-heading span {
  font-size: 11px;
  font-weight: 800;
  color: hsl(var(--primary));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.request-heading h2 {
  margin: 5px 0 0;
  font-size: 18px;
}

.request-content p {
  margin: 0;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
}

blockquote {
  padding: 10px 12px;
  margin: 0;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 45%);
  border-left: 3px solid hsl(var(--primary));
}

.request-item footer {
  padding-top: var(--space-3);
  border-top: 1px solid hsl(var(--border));
}

.request-item footer span {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.request-skeleton {
  min-height: 170px;
  background: hsl(var(--muted) / 45%);
  border-radius: var(--radius-lg);
}

@media (width <= 620px) {
  .requests-page {
    padding: var(--space-4);
  }
}
</style>
