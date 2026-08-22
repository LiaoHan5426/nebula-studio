<script setup lang="ts">
import type { BackendLoginResult } from '@nebula-studio/auth-provider/backend';

import type { AuthFlowStep } from './authFlow';

import { computed, nextTick, ref, watch } from 'vue';

import {
  completeLoginWithOrg,
  loginWithBackendAuth,
} from '@nebula-studio/auth-provider/backend';
import {
  isSafeAuthReturnUrl,
  isWebPresentationHost,
  writeWebAuthSession,
} from '@nebula-studio/app-shell';
import { NebulaAuthLayout } from '@nebula-studio/nebula-layout';
import {
  NebulaButton,
  NebulaIcon,
  NebulaInput,
  NebulaSelect,
} from '@nebula-studio/nebula-ui';

import {
  authFlowReducer,
  canPersistFinalToken,
  createInitialAuthFlowState,
} from './authStateMachine';
import { classifyAuthFailure, readAuthEntryContext } from './authFlow';

const RECENT_ORG_KEY = 'nebula-auth-recent-org';
const user = ref('');
const password = ref('');
const busy = ref(false);
const orgQuery = ref('');
const entryContext = readAuthEntryContext(location.search);
const showDemoAccounts = import.meta.env.DEV;
const flowState = ref(
  createInitialAuthFlowState(
    entryContext ? classifyAuthFailure(new Error(entryContext)) : null,
  ),
);
const step = computed(() => flowState.value.step);
const failure = computed(() => flowState.value.failure);
const pendingLogin = computed(() => flowState.value.pendingLogin);
const selectedOrgId = computed({
  get: () => flowState.value.selectedOrgId,
  set: (value: string) => {
    flowState.value = authFlowReducer(flowState.value, {
      type: 'ORG_SELECTED',
      orgId: value,
    });
  },
});
const mfaCode = computed({
  get: () => flowState.value.mfaCode,
  set: (value: string) => {
    flowState.value = authFlowReducer(flowState.value, {
      type: 'MFA_CODE_CHANGED',
      value,
    });
  },
});
const recoveryAccount = computed({
  get: () => flowState.value.recoveryAccount,
  set: (value: string) => {
    flowState.value = { ...flowState.value, recoveryAccount: value };
  },
});

const authTitle = computed(() => {
  const titles: Record<AuthFlowStep, string> = {
    credentials: '登录 Nebula',
    organization: '选择组织',
    mfa: '完成二次验证',
    recovery: '恢复账户访问',
    success: '登录成功',
    failure: failure.value?.title ?? '登录未完成',
  };
  return titles[step.value];
});

const authDescription = computed(() => {
  const descriptions: Record<AuthFlowStep, string> = {
    credentials: '使用你的平台账户进入个人工作台。',
    organization: '选择本次会话使用的组织空间，之后可在工作台切换。',
    mfa: '输入认证器提供的一次性验证码。',
    recovery: '确认账户后查看可用的恢复方式。',
    success: '正在恢复登录前的页面和任务上下文。',
    failure: failure.value?.message ?? '请返回后重试。',
  };
  return descriptions[step.value];
});

const filteredOrganizations = computed(() => {
  const keyword = orgQuery.value.trim().toLocaleLowerCase();
  const organizations = pendingLogin.value?.organizations ?? [];
  return organizations
    .filter(
      (org) =>
        !keyword ||
        org.orgName.toLocaleLowerCase().includes(keyword) ||
        org.orgCode.toLocaleLowerCase().includes(keyword),
    )
    .toSorted((a, b) => {
      const recent = localStorage.getItem(RECENT_ORG_KEY);
      if (a.id === recent) return -1;
      if (b.id === recent) return 1;
      return Number(Boolean(b.primary)) - Number(Boolean(a.primary));
    });
});

const entryMessage = computed(() => {
  if (entryContext === 'session-expired')
    return '会话已过期。重新登录后将返回之前的页面。';
  if (entryContext === 'permission-changed')
    return '你的访问权限已发生变化，请重新验证账户。';
  return '';
});

watch(step, async () => {
  await nextTick();
  document
    .querySelector<HTMLElement>(
      'form input:not([disabled]), .auth-state button, form button',
    )
    ?.focus();
});

function rememberOrganization(): void {
  if (selectedOrgId.value)
    localStorage.setItem(RECENT_ORG_KEY, selectedOrgId.value);
}

async function finishLogin(result: BackendLoginResult): Promise<void> {
  if (!canPersistFinalToken(flowState.value) && !result.token) {
    return;
  }
  const { username, token, roles, userId } = result;
  if (!token) {
    return;
  }
  const session = {
    user: username,
    token,
    roles,
    userId: userId === undefined ? undefined : String(userId),
  };

  rememberOrganization();
  flowState.value = authFlowReducer(flowState.value, { type: 'SUCCESS' });
  await new Promise<void>((resolve) => window.setTimeout(resolve, 350));

  if (isWebPresentationHost()) {
    writeWebAuthSession(session);
    const params = new URLSearchParams(location.search);
    const requestedReturn = params.get('return') ?? params.get('redirect');
    const fallback = `${location.origin}/`;
    location.href =
      requestedReturn && isSafeAuthReturnUrl(requestedReturn)
        ? requestedReturn
        : fallback;
    return;
  }

  const electronWindow = window as unknown as {
    api?: {
      auth?: {
        establishSession?: (payload: {
          roles?: string[];
          token: string;
          user: string;
          userId?: string;
        }) => Promise<boolean>;
      };
    };
  };
  if (
    typeof electronWindow.api?.auth?.establishSession === 'function' &&
    token
  ) {
    await electronWindow.api.auth.establishSession({ ...session, token });
    return;
  }

  writeWebAuthSession(session);
  window.close();
}

function handleFailure(error: unknown): void {
  const classified = classifyAuthFailure(error);
  password.value = '';
  flowState.value = authFlowReducer(flowState.value, {
    type: 'FAILURE',
    failure: classified,
  });
}

async function onSubmit(): Promise<void> {
  flowState.value = { ...flowState.value, failure: null };
  busy.value = true;
  try {
    const result = await loginWithBackendAuth(user.value, password.value);
    flowState.value = authFlowReducer(flowState.value, {
      type: 'CREDENTIALS_SUBMITTED',
      result,
    });
    if (flowState.value.step === 'organization') {
      const recent = localStorage.getItem(RECENT_ORG_KEY);
      selectedOrgId.value =
        result.organizations?.find((org) => org.id === recent)?.id ??
        result.organizations?.find((org) => org.primary)?.id ??
        result.organizations?.[0]?.id ??
        '';
      return;
    }
    if (flowState.value.step === 'success') {
      await finishLogin(result);
    }
  } catch (error) {
    handleFailure(error);
  } finally {
    busy.value = false;
  }
}

async function onOrgSubmit(): Promise<void> {
  if (!pendingLogin.value || !selectedOrgId.value) return;
  flowState.value = { ...flowState.value, failure: null };
  busy.value = true;
  try {
    const completed = await completeLoginWithOrg(
      selectedOrgId.value,
      pendingLogin.value.token,
    );
    const merged = {
      ...pendingLogin.value,
      ...completed,
      username: completed.username || pendingLogin.value.username,
      token: completed.token ?? pendingLogin.value.token,
    };
    flowState.value = authFlowReducer(flowState.value, {
      type: 'ORG_SUBMITTED',
      result: merged,
    });
    if (flowState.value.step === 'success') {
      await finishLogin(merged);
    }
  } catch (error) {
    handleFailure(error);
  } finally {
    busy.value = false;
  }
}

function backToCredentials(): void {
  orgQuery.value = '';
  flowState.value = authFlowReducer(flowState.value, {
    type: 'BACK_TO_CREDENTIALS',
  });
}
</script>

<template>
  <NebulaAuthLayout
    :title="authTitle"
    :description="authDescription"
    eyebrow="欢迎回来"
  >
    <template #brand>
      <div class="login-brand">
        <div class="login-brand__logo">N</div>
        <p class="login-brand__eyebrow">Nebula Studio</p>
        <h1>连接数据、服务与流程</h1>
        <p class="login-brand__description">
          一个入口完成资源发现、访问申请、集成开发与运行管理。
        </p>
        <div class="login-brand__features">
          <span>统一的个人工作台</span>
          <span>按角色进入对应任务界面</span>
          <span>Web 与桌面端连续会话</span>
        </div>
      </div>
    </template>

    <form v-if="step === 'credentials'" @submit.prevent="onSubmit">
      <p v-if="entryMessage" class="login-context" role="status">
        {{ entryMessage }}
      </p>
      <label class="login-field">
        <span>用户名</span>
        <NebulaInput
          v-model="user"
          type="text"
          autocomplete="username"
          placeholder="请输入用户名"
          required
        />
      </label>
      <label class="login-field">
        <span>密码</span>
        <NebulaInput
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="请输入密码"
          required
        />
      </label>
      <button type="button" class="login-link" @click="step = 'recovery'">
        无法登录？
      </button>
      <NebulaButton
        class="login-submit"
        type="submit"
        variant="primary"
        :disabled="busy"
      >
        {{ busy ? '正在登录…' : '登录' }}
      </NebulaButton>
    </form>

    <form v-else-if="step === 'organization'" @submit.prevent="onOrgSubmit">
      <label class="login-field">
        <span>搜索组织</span>
        <NebulaInput
          v-model="orgQuery"
          type="text"
          autocomplete="organization"
          placeholder="按名称或组织编码搜索"
        />
      </label>
      <label class="login-field">
        <span>组织</span>
        <NebulaSelect
          v-model="selectedOrgId"
          :options="filteredOrganizations"
          label-key="orgName"
          value-key="id"
          placeholder="请选择组织"
        />
      </label>
      <div class="login-actions">
        <NebulaButton type="button" variant="ghost" @click="backToCredentials">
          返回登录
        </NebulaButton>
        <NebulaButton
          type="submit"
          variant="primary"
          :disabled="busy || !selectedOrgId"
        >
          {{ busy ? '正在进入…' : '进入工作台' }}
        </NebulaButton>
      </div>
    </form>

    <form v-else-if="step === 'mfa'" @submit.prevent>
      <label class="login-field">
        <span>一次性验证码</span>
        <NebulaInput
          v-model="mfaCode"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          placeholder="6 位验证码"
          disabled
        />
      </label>
      <p class="login-context" role="status">
        当前认证服务尚未开放 MFA 校验接口，无法安全提交验证码。
      </p>
      <NebulaButton
        class="login-submit"
        variant="outline"
        @click="backToCredentials"
      >
        返回登录
      </NebulaButton>
    </form>

    <form v-else-if="step === 'recovery'" @submit.prevent>
      <label class="login-field">
        <span>用户名或邮箱</span>
        <NebulaInput
          v-model="recoveryAccount"
          type="text"
          autocomplete="username email"
          placeholder="输入需要恢复的账户"
        />
      </label>
      <p class="login-context" role="status">
        当前部署未配置自助恢复接口。请联系组织管理员重置凭证。
      </p>
      <NebulaButton
        class="login-submit"
        variant="outline"
        @click="backToCredentials"
      >
        返回登录
      </NebulaButton>
    </form>

    <section v-else-if="step === 'success'" class="auth-state" role="status">
      <span class="auth-state__icon is-success">
        <NebulaIcon icon="circle-check" size="28" />
      </span>
      <strong>身份验证已完成</strong>
      <p>正在进入工作台并恢复登录前的页面…</p>
    </section>

    <section v-else class="auth-state" role="alert">
      <span class="auth-state__icon">
        <NebulaIcon icon="triangle-alert" size="28" />
      </span>
      <strong>{{ failure?.title }}</strong>
      <p>{{ failure?.message }}</p>
      <div class="login-actions">
        <NebulaButton
          v-if="failure?.retryable"
          variant="primary"
          @click="backToCredentials"
        >
          返回并重试
        </NebulaButton>
        <NebulaButton v-else variant="outline" @click="backToCredentials">
          使用其他账户
        </NebulaButton>
        <NebulaButton variant="ghost" @click="step = 'recovery'">
          获取帮助
        </NebulaButton>
      </div>
    </section>

    <template #footer>
      <p v-if="showDemoAccounts && step === 'credentials'" class="login-demo">
        开发环境演示账户：demo / demo 或 admin / admin123
      </p>
    </template>
  </NebulaAuthLayout>
</template>

<style lang="scss" scoped>
.login-brand {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
  padding: 64px;
  overflow: hidden;
}

.login-brand::after {
  position: absolute;
  right: -110px;
  bottom: -150px;
  width: 360px;
  height: 360px;
  content: '';
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 50%;
  box-shadow:
    0 0 0 42px rgb(255 255 255 / 4%),
    0 0 0 88px rgb(255 255 255 / 3%);
}

.login-brand__logo {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 34px;
  font-size: 22px;
  font-weight: 800;
  background: rgb(255 255 255 / 16%);
  border: 1px solid rgb(255 255 255 / 24%);
  border-radius: 14px;
}

.login-brand__eyebrow {
  margin: 0 0 9px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  opacity: 0.78;
}

.login-brand h1 {
  max-width: 380px;
  margin: 0;
  font-size: clamp(30px, 3vw, 42px);
  line-height: 1.14;
  letter-spacing: -0.035em;
}

.login-brand__description {
  max-width: 380px;
  margin: 18px 0 30px;
  line-height: 1.7;
  opacity: 0.76;
}

.login-brand__features {
  display: grid;
  gap: 10px;
  font-size: 12px;
  opacity: 0.84;
}

.login-brand__features span::before {
  margin-right: 9px;
  color: #9ff5d0;
  content: '✓';
}

.login-demo,
.login-context,
.auth-state p {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.login-demo {
  margin: 15px 0 0;
  text-align: center;
}

.login-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 17px;
}

.login-field > span {
  font-size: 12px;
  font-weight: 600;
}

.login-context {
  padding: 10px 12px;
  margin: 0 0 16px;
  line-height: 1.6;
  background: hsl(var(--primary) / 8%);
  border: 1px solid hsl(var(--primary) / 20%);
  border-radius: var(--radius-md);
}

.login-link {
  display: block;
  padding: 0;
  margin: -4px 0 16px auto;
  font: inherit;
  font-size: 12px;
  color: hsl(var(--primary));
  cursor: pointer;
  background: transparent;
  border: 0;
}

.login-submit {
  width: 100%;
  margin-top: 5px;
}

.login-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
  margin-top: var(--space-4);
}

.auth-state {
  display: grid;
  gap: var(--space-3);
  justify-items: center;
  padding: var(--space-5) 0;
  text-align: center;
}

.auth-state__icon {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  color: hsl(var(--danger));
  background: hsl(var(--danger) / 10%);
  border-radius: 50%;
}

.auth-state__icon.is-success {
  color: hsl(var(--success));
  background: hsl(var(--success) / 10%);
}

.auth-state p {
  margin: 0;
  line-height: 1.6;
}

@media (width <= 48rem) {
  .login-brand {
    padding: var(--space-8);
  }
}
</style>
