<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  NebulaButton,
  NebulaEmptyState,
  NebulaInput,
  NebulaPageHeader,
  NebulaSelect,
} from '@nebula-studio/nebula-ui';

import { getAuthUserId } from '@/shared/auth/session';
import { useTenant } from '@/shared/composables/useTenant';
import { isApiSuccess } from '@/shared/types';

import { loadResourceCatalog, submitAccessRequest } from './api';
import {
  canAdvanceAccessRequest,
  nextAccessRequestStep,
  previousAccessRequestStep,
} from './request-state';
import type { AccessRequestStep } from './request-state';
import {
  clearAccessDraft,
  readAccessDraft,
  trackPortalEvent,
  writeAccessDraft,
} from './storage';
import { DEFAULT_ACCESS_REQUEST_DRAFT } from './types';
import type { AccessRequestDraft, ResourceSummaryViewModel } from './types';

const route = useRoute();
const router = useRouter();
const { currentTenantId } = useTenant();
const resource = ref<ResourceSummaryViewModel>();
const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const step = ref<AccessRequestStep>(1);
const submittedRequestId = ref('');
const resourceId = decodeURIComponent(String(route.params.resourceId));
const draft = reactive<AccessRequestDraft>({
  ...DEFAULT_ACCESS_REQUEST_DRAFT,
  ...readAccessDraft(resourceId),
});

const stepValid = computed(() => canAdvanceAccessRequest(step.value, draft));

watch(draft, () => writeAccessDraft(resourceId, draft), { deep: true });

async function load(): Promise<void> {
  try {
    const result = await loadResourceCatalog(
      currentTenantId.value || undefined,
    );
    resource.value = result.items.find((item) => item.id === resourceId);
    if (!resource.value) error.value = '资源不存在或已经下线。';
    else if (
      !['AVAILABLE', 'APPROVAL_REQUIRED'].includes(resource.value.availability)
    ) {
      error.value = '该资源当前不可申请，请返回目录选择在线资源。';
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '申请页加载失败。';
  } finally {
    loading.value = false;
  }
}

function next(): void {
  if (!stepValid.value) return;
  step.value = nextAccessRequestStep(step.value);
}

async function submit(): Promise<void> {
  const tenantId = currentTenantId.value;
  const userId = getAuthUserId();
  if (!tenantId || !userId || !resource.value) {
    error.value = '缺少当前组织或用户信息，请重新登录后再试。草稿已保留。';
    return;
  }
  submitting.value = true;
  error.value = '';
  try {
    const response = await submitAccessRequest(
      tenantId,
      userId,
      resource.value,
      draft,
    );
    if (!isApiSuccess(response)) {
      error.value = response.message || '提交失败，草稿已保留。';
      return;
    }
    submittedRequestId.value = response.data.requestId;
    clearAccessDraft(resourceId);
    trackPortalEvent('access_request_submitted', {
      resourceId: resource.value.id,
      kind: resource.value.kind,
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : '';
    error.value = /409|duplicate/i.test(message)
      ? '你已经提交过相同资源的申请，请前往“我的申请”查看进度。'
      : /403/.test(message)
        ? '当前账号无权申请此资源，请联系组织管理员。'
        : '网络或服务暂时不可用，申请草稿已保留，可稍后重试。';
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  trackPortalEvent('access_request_started', { resourceId });
  void load();
});
</script>

<template>
  <main class="request-page">
    <button class="back-button" type="button" @click="router.back()">
      ← 返回资源详情
    </button>
    <div v-if="loading" class="request-loading" />
    <NebulaEmptyState
      v-else-if="!resource"
      title="无法发起申请"
      :description="error"
    >
      <NebulaButton @click="router.push('/catalog')">返回目录</NebulaButton>
    </NebulaEmptyState>
    <section v-else-if="submittedRequestId" class="success-card" role="status">
      <span class="success-icon">✓</span>
      <h1>申请已提交</h1>
      <p>
        申请编号
        {{ submittedRequestId }}。审批进度与需要补充的信息会显示在“我的申请”中。
      </p>
      <div>
        <NebulaButton @click="router.push('/my-requests')">
          查看申请进度
        </NebulaButton>
        <NebulaButton variant="outline" @click="router.push('/catalog')">
          继续浏览资源
        </NebulaButton>
      </div>
    </section>
    <template v-else>
      <NebulaPageHeader
        eyebrow="Access request"
        :title="`申请 ${resource.name}`"
        description="说明使用场景与最小权限范围，提交前可完整预览；未成功提交的内容会保存在当前设备。"
      />

      <ol class="steps" aria-label="申请步骤">
        <li v-for="index in 4" :key="index" :class="{ active: step >= index }">
          <span>{{ index }}</span>
          {{ ['用途', '环境与期限', '范围确认', '提交预览'][index - 1] }}
        </li>
      </ol>

      <section class="request-card">
        <div v-if="step === 1" class="form-step">
          <span class="step-eyebrow">Step 1</span>
          <h2>你准备如何使用这项资源？</h2>
          <p>请写明业务场景、使用者和预期价值，至少 10 个字符。</p>
          <label>
            用途说明
            <textarea
              v-model="draft.purpose"
              rows="7"
              placeholder="例如：订单运营团队将在内部看板中读取每日履约状态，用于异常订单跟进。"
            />
          </label>
          <span class="field-hint"
            >{{ draft.purpose.length }} / 至少 10 字符</span
          >
        </div>

        <div v-else-if="step === 2" class="form-step">
          <span class="step-eyebrow">Step 2</span>
          <h2>选择使用环境与期限</h2>
          <p>生产环境和较长期限通常需要更严格的审批。</p>
          <div class="field-grid">
            <label>
              使用环境
              <NebulaSelect
                v-model="draft.environment"
                :options="[
                  { label: '开发环境', value: 'DEVELOPMENT' },
                  { label: '测试环境', value: 'TEST' },
                  { label: '生产环境', value: 'PRODUCTION' },
                ]"
              />
            </label>
            <label>
              申请期限
              <NebulaSelect
                v-model="draft.duration"
                :options="[
                  { label: '30 天', value: '30_DAYS' },
                  { label: '90 天', value: '90_DAYS' },
                  { label: '1 年', value: 'ONE_YEAR' },
                ]"
              />
            </label>
          </div>
        </div>

        <div v-else-if="step === 3" class="form-step">
          <span class="step-eyebrow">Step 3</span>
          <h2>确认最小权限范围</h2>
          <p>只申请完成当前用途所必需的访问范围。</p>
          <label>
            权限范围
            <NebulaInput
              v-model="draft.scope"
              placeholder="例如：只读、订单基础字段"
            />
          </label>
          <label class="check-field">
            <input v-model="draft.sensitivityConfirmed" type="checkbox" />
            <span>
              我已了解该资源可能包含敏感数据，并承诺遵守组织的数据使用、存储与分享政策。
            </span>
          </label>
        </div>

        <div v-else class="form-step">
          <span class="step-eyebrow">Step 4</span>
          <h2>提交前预览</h2>
          <p>请确认内容准确。审批人会根据以下信息评估访问范围。</p>
          <dl class="preview">
            <div>
              <dt>资源</dt>
              <dd>{{ resource.name }}</dd>
            </div>
            <div>
              <dt>类型</dt>
              <dd>{{ resource.kind }}</dd>
            </div>
            <div>
              <dt>用途</dt>
              <dd>{{ draft.purpose }}</dd>
            </div>
            <div>
              <dt>环境</dt>
              <dd>{{ draft.environment }}</dd>
            </div>
            <div>
              <dt>期限</dt>
              <dd>{{ draft.duration }}</dd>
            </div>
            <div>
              <dt>范围</dt>
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
            上一步
          </NebulaButton>
          <span>草稿自动保存</span>
          <NebulaButton v-if="step < 4" :disabled="!stepValid" @click="next">
            继续
          </NebulaButton>
          <NebulaButton v-else :disabled="submitting" @click="submit">
            {{ submitting ? '正在提交…' : '提交申请' }}
          </NebulaButton>
        </footer>
      </section>
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
