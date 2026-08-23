<script setup lang="ts">
import type { AccessRequestStep } from './request-state';
import type { AccessRequestDraft } from './types';

import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import {
  NebulaButton,
  NebulaCheckbox,
  NebulaEmptyState,
  NebulaForm,
  NebulaFormItem,
  NebulaInput,
  NebulaPageHeader,
  NebulaSelect,
  NebulaStepFlow,
} from '@nebula-studio/nebula-ui';

import { getAuthUserId } from '@/shared/auth/session';
import { useTenant } from '@/shared/composables/useTenant';
import { errorMessageKey, mapIntegrationErrorCode } from '@/shared/i18n/errors';
import { integrationQueryKeys } from '@/shared/query/keys';
import { usePortalStore } from '@/shared/state/portalStore';
import { isApiSuccess } from '@/shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

import {
  resourceCatalogQueryKey,
  resourceCatalogQueryOptions,
  submitAccessRequestMutationOptions,
} from './queryOptions';
import {
  canAdvanceAccessRequest,
  nextAccessRequestStep,
  previousAccessRequestStep,
} from './request-state';
import { trackPortalEvent } from './storage';
import { DEFAULT_ACCESS_REQUEST_DRAFT } from './types';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { currentTenantId } = useTenant();
const portal = usePortalStore();
const queryClient = useQueryClient();
const submitting = ref(false);
const error = ref('');
const step = ref<AccessRequestStep>(1);
const submittedRequestId = ref('');
const resourceId = decodeURIComponent(String(route.params.resourceId));
const draft = reactive<AccessRequestDraft>({
  ...DEFAULT_ACCESS_REQUEST_DRAFT,
  ...portal.readDraft(resourceId),
});

const catalogQuery = useQuery(() =>
  resourceCatalogQueryOptions(currentTenantId.value || undefined),
);
const submitMutation = useMutation(submitAccessRequestMutationOptions());

const resource = computed(() =>
  catalogQuery.data.value?.items.find((item) => item.id === resourceId),
);

const loadError = computed(() => {
  if (catalogQuery.error.value) {
    return t(
      errorMessageKey(mapIntegrationErrorCode(catalogQuery.error.value)),
    );
  }
  if (catalogQuery.isPending.value) return '';
  if (!resource.value) return t('catalog.apply.missing');
  if (
    !['APPROVAL_REQUIRED', 'AVAILABLE'].includes(resource.value.availability)
  ) {
    return t('catalog.apply.notOpen');
  }
  return '';
});

const stepValid = computed(() => canAdvanceAccessRequest(step.value, draft));

const stepItems = computed(() =>
  ([1, 2, 3, 4] as const).map((index) => ({
    id: String(index),
    label: t(`catalog.apply.stepLabel.${index}`),
    state:
      step.value > index
        ? ('complete' as const)
        : step.value === index
          ? ('current' as const)
          : ('pending' as const),
  })),
);

watch(draft, () => portal.writeDraft(resourceId, { ...draft }), { deep: true });

function next(): void {
  if (!stepValid.value) return;
  step.value = nextAccessRequestStep(step.value);
}

async function submit(): Promise<void> {
  const tenantId = currentTenantId.value;
  const userId = getAuthUserId();
  if (!tenantId || !userId || !resource.value) {
    error.value = t('errors.session');
    return;
  }
  submitting.value = true;
  error.value = '';
  try {
    const response = await submitMutation.mutateAsync({
      tenantId,
      userId,
      resource: resource.value,
      draft,
    });
    if (!isApiSuccess(response)) {
      error.value = response.message || t('errors.submit');
      return;
    }
    submittedRequestId.value = response.data.requestId;
    portal.clearDraft(resourceId);
    await queryClient.invalidateQueries({
      queryKey: resourceCatalogQueryKey(tenantId),
    });
    await queryClient.invalidateQueries({
      queryKey: integrationQueryKeys.accessRequestsRoot(),
    });
    trackPortalEvent('access_request_submitted', {
      resourceId: resource.value.id,
      kind: resource.value.kind,
    });
  } catch (cause) {
    error.value = t(errorMessageKey(mapIntegrationErrorCode(cause)));
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  trackPortalEvent('access_request_started', { resourceId });
});
</script>

<template>
  <main class="request-page">
    <button class="back-button" type="button" @click="router.back()">
      {{ t('catalog.apply.backDetail') }}
    </button>
    <div v-if="catalogQuery.isPending" class="request-loading"></div>
    <NebulaEmptyState
      v-else-if="!resource || loadError"
      :title="t('catalog.apply.cannotStart')"
      :description="loadError"
    >
      <NebulaButton @click="router.push('/catalog')">
        {{ t('catalog.backToCatalog') }}
      </NebulaButton>
    </NebulaEmptyState>
    <section v-else-if="submittedRequestId" class="success-card" role="status">
      <span class="success-icon">✓</span>
      <h1>{{ t('catalog.apply.submittedTitle') }}</h1>
      <p>
        {{ t('catalog.apply.submittedBody', { id: submittedRequestId }) }}
      </p>
      <div>
        <NebulaButton @click="router.push('/my-requests')">
          {{ t('catalog.viewRequests') }}
        </NebulaButton>
        <NebulaButton variant="outline" @click="router.push('/catalog')">
          {{ t('catalog.apply.keepBrowsing') }}
        </NebulaButton>
      </div>
    </section>
    <template v-else>
      <NebulaPageHeader
        :eyebrow="t('catalog.apply.eyebrow')"
        :title="t('catalog.apply.title', { name: resource.name })"
        :description="t('catalog.apply.description')"
      />

      <NebulaStepFlow
        :label="t('catalog.apply.stepsAria')"
        :steps="stepItems"
      />

      <NebulaForm class="request-card" :initial-values="draft" keep-values>
        <div v-if="step === 1" class="form-step">
          <span class="step-eyebrow">Step 1</span>
          <h2>{{ t('catalog.apply.step1Title') }}</h2>
          <p>{{ t('catalog.apply.step1Body') }}</p>
          <NebulaFormItem
            name="purpose"
            :label="t('catalog.apply.purpose')"
            :hint="t('catalog.apply.purposeHint', { n: draft.purpose.length })"
            required
          >
            <textarea
              v-model="draft.purpose"
              rows="7"
              :placeholder="t('catalog.apply.purposePlaceholder')"
            ></textarea>
          </NebulaFormItem>
        </div>

        <div v-else-if="step === 2" class="form-step">
          <span class="step-eyebrow">Step 2</span>
          <h2>{{ t('catalog.apply.step2Title') }}</h2>
          <p>{{ t('catalog.apply.step2Body') }}</p>
          <div class="field-grid">
            <NebulaFormItem
              name="environment"
              :label="t('catalog.apply.environment')"
              required
            >
              <NebulaSelect
                v-model="draft.environment"
                :options="[
                  { label: t('catalog.apply.env.dev'), value: 'DEVELOPMENT' },
                  { label: t('catalog.apply.env.test'), value: 'TEST' },
                  { label: t('catalog.apply.env.prod'), value: 'PRODUCTION' },
                ]"
              />
            </NebulaFormItem>
            <NebulaFormItem
              name="duration"
              :label="t('catalog.apply.duration')"
              required
            >
              <NebulaSelect
                v-model="draft.duration"
                :options="[
                  { label: t('catalog.apply.dur.30'), value: '30_DAYS' },
                  { label: t('catalog.apply.dur.90'), value: '90_DAYS' },
                  { label: t('catalog.apply.dur.year'), value: 'ONE_YEAR' },
                ]"
              />
            </NebulaFormItem>
          </div>
        </div>

        <div v-else-if="step === 3" class="form-step">
          <span class="step-eyebrow">Step 3</span>
          <h2>{{ t('catalog.apply.step3Title') }}</h2>
          <p>{{ t('catalog.apply.step3Body') }}</p>
          <NebulaFormItem name="scope" :label="t('catalog.apply.scope')">
            <NebulaInput
              v-model="draft.scope"
              :placeholder="t('catalog.apply.scopePlaceholder')"
            />
          </NebulaFormItem>
          <NebulaFormItem name="sensitivityConfirmed">
            <NebulaCheckbox v-model="draft.sensitivityConfirmed">
              {{ t('catalog.apply.sensitivity') }}
            </NebulaCheckbox>
          </NebulaFormItem>
        </div>

        <div v-else class="form-step">
          <span class="step-eyebrow">Step 4</span>
          <h2>{{ t('catalog.apply.step4Title') }}</h2>
          <p>{{ t('catalog.apply.step4Body') }}</p>
          <dl class="preview">
            <div>
              <dt>{{ t('catalog.apply.preview.resource') }}</dt>
              <dd>{{ resource.name }}</dd>
            </div>
            <div>
              <dt>{{ t('catalog.apply.preview.kind') }}</dt>
              <dd>{{ resource.kind }}</dd>
            </div>
            <div>
              <dt>{{ t('catalog.apply.preview.purpose') }}</dt>
              <dd>{{ draft.purpose }}</dd>
            </div>
            <div>
              <dt>{{ t('catalog.apply.preview.environment') }}</dt>
              <dd>{{ draft.environment }}</dd>
            </div>
            <div>
              <dt>{{ t('catalog.apply.preview.duration') }}</dt>
              <dd>{{ draft.duration }}</dd>
            </div>
            <div>
              <dt>{{ t('catalog.apply.preview.scope') }}</dt>
              <dd>{{ draft.scope }}</dd>
            </div>
          </dl>
        </div>

        <p v-if="error" class="request-error" role="alert">{{ error }}</p>
        <footer class="request-actions">
          <NebulaButton
            variant="outline"
            :disabled="step === 1"
            @click="step = previousAccessRequestStep(step)"
          >
            {{ t('catalog.apply.prev') }}
          </NebulaButton>
          <span>{{ t('catalog.apply.draftSaved') }}</span>
          <NebulaButton v-if="step < 4" :disabled="!stepValid" @click="next">
            {{ t('catalog.apply.continue') }}
          </NebulaButton>
          <NebulaButton v-else :disabled="submitting" @click="submit">
            {{
              submitting
                ? t('catalog.apply.submitting')
                : t('catalog.apply.submit')
            }}
          </NebulaButton>
        </footer>
      </NebulaForm>
    </template>
  </main>
</template>

<style scoped>
.request-page {
  display: grid;
  gap: var(--space-5);
  max-width: 900px;
  padding: var(--space-6);
  margin: 0 auto;
}

.back-button {
  justify-self: start;
  padding: 0;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: none;
  border: 0;
}

.request-loading {
  min-height: 480px;
  background: hsl(var(--muted) / 45%);
  border-radius: var(--radius-lg);
}

.steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  padding: 0;
  margin: 0;
  list-style: none;
}

.steps li {
  position: relative;
  display: grid;
  gap: 8px;
  justify-items: center;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.steps li::before {
  position: absolute;
  top: 15px;
  right: 50%;
  left: -50%;
  z-index: -1;
  height: 2px;
  content: '';
  background: hsl(var(--border));
}

.steps li:first-child::before {
  display: none;
}

.steps span {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  font-weight: 700;
  background: hsl(var(--muted));
  border-radius: 50%;
}

.steps li.active {
  color: hsl(var(--primary));
}

.steps li.active span,
.steps li.active::before {
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
}

.request-card,
.success-card {
  padding: clamp(24px, 5vw, 48px);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius-lg) + 6px);
}

.form-step {
  display: grid;
  gap: var(--space-4);
  min-height: 320px;
}

.step-eyebrow {
  font-size: 11px;
  font-weight: 800;
  color: hsl(var(--primary));
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.form-step h2 {
  margin: 0;
  font-size: 24px;
}

.form-step > p {
  margin: -8px 0 4px;
  color: hsl(var(--muted-foreground));
}

.form-step label,
.field-grid label {
  display: grid;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
}

textarea {
  width: 100%;
  padding: 12px;
  font: inherit;
  color: hsl(var(--foreground));
  resize: vertical;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
}

textarea:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}

.field-hint {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  text-align: right;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.check-field {
  display: grid !important;
  grid-template-columns: auto 1fr;
  align-items: start;
  padding: var(--space-4);
  line-height: 1.6;
  background: hsl(var(--muted) / 55%);
  border-radius: var(--radius-md);
}

.check-field input {
  width: 18px;
  height: 18px;
}

.preview {
  display: grid;
  margin: 0;
}

.preview div {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  gap: var(--space-4);
  padding: 12px 0;
  border-bottom: 1px solid hsl(var(--border));
}

.preview dt {
  color: hsl(var(--muted-foreground));
}

.preview dd {
  margin: 0;
}

.request-error {
  padding: 12px;
  color: hsl(var(--destructive));
  background: hsl(var(--destructive) / 10%);
  border-radius: var(--radius-md);
}

.request-actions {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  padding-top: var(--space-5);
  margin-top: var(--space-5);
  border-top: 1px solid hsl(var(--border));
}

.request-actions span {
  margin-right: auto;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.success-card {
  display: grid;
  gap: var(--space-4);
  justify-items: center;
  padding-block: 72px;
  text-align: center;
}

.success-icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  font-size: 30px;
  color: white;
  background: hsl(var(--success, 145 60% 40%));
  border-radius: 50%;
}

.success-card h1,
.success-card p {
  margin: 0;
}

.success-card p {
  max-width: 560px;
  line-height: 1.7;
  color: hsl(var(--muted-foreground));
}

.success-card > div {
  display: flex;
  gap: var(--space-3);
}

@media (width <= 620px) {
  .request-page {
    padding: var(--space-4);
  }

  .steps li {
    font-size: 0;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
