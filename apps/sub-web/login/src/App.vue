<script setup lang="ts">
import {
  completeLoginWithOrg,
  isSafeAuthReturnUrl,
  isWebPresentationHost,
  loginWithBackendAuth,
  writeWebAuthSession,
} from '@nebula-studio/app-shell';
import type { BackendLoginResult } from '@nebula-studio/app-shell';
import {
  NebulaButton,
  NebulaInput,
  NebulaSelect,
} from '@nebula-studio/nebula-ui';
import { ref } from 'vue';

const user = ref('');
const password = ref('');
const errorMsg = ref('');
const busy = ref(false);
const step = ref<'credentials' | 'org'>('credentials');
const pendingLogin = ref<BackendLoginResult | null>(null);
const selectedOrgId = ref('');

async function finishLogin(username: string, token?: string): Promise<void> {
  if (isWebPresentationHost()) {
    writeWebAuthSession({
      user: username,
      token,
    });
    const ret = new URLSearchParams(location.search).get('return');
    const fallback = new URL('index.html', location.href).toString();
    const target = ret && isSafeAuthReturnUrl(ret) ? ret : fallback;
    location.href = target;
    return;
  }

  const electronWindow = window as unknown as {
    api?: {
      auth?: {
        establishSession?: (payload: {
          user: string;
          token: string;
        }) => Promise<boolean>;
      };
    };
  };
  if (
    typeof electronWindow.api?.auth?.establishSession === 'function' &&
    token
  ) {
    await electronWindow.api.auth.establishSession({ user: username, token });
    return;
  }

  writeWebAuthSession({
    user: username,
    token,
  });
  window.close();
}

async function onSubmit(): Promise<void> {
  errorMsg.value = '';
  busy.value = true;
  try {
    const result = await loginWithBackendAuth(user.value, password.value);
    if (result.needsOrgSelection) {
      pendingLogin.value = result;
      selectedOrgId.value =
        result.organizations?.find((org) => org.primary)?.id ??
        result.organizations?.[0]?.id ??
        '';
      step.value = 'org';
      return;
    }
    await finishLogin(result.username, result.token);
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : String(e);
  } finally {
    busy.value = false;
  }
}

async function onOrgSubmit(): Promise<void> {
  if (!pendingLogin.value || !selectedOrgId.value) {
    errorMsg.value = '请选择组织';
    return;
  }
  errorMsg.value = '';
  busy.value = true;
  try {
    const completed = await completeLoginWithOrg(
      selectedOrgId.value,
      pendingLogin.value.token,
    );
    await finishLogin(
      pendingLogin.value.username,
      completed.token ?? pendingLogin.value.token,
    );
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : String(e);
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="login-page" data-theme="dark">
    <div class="login-card">
      <h1 class="login-title">登录</h1>
      <p class="login-hint">
        使用后端账号登录（默认 demo / demo，或 admin / admin123）
      </p>

      <template v-if="step === 'credentials'">
        <label class="login-field">
          <span class="login-label">用户名</span>
          <NebulaInput
            v-model="user"
            type="text"
            autocomplete="username"
            @keydown.enter.prevent="onSubmit"
          />
        </label>
        <label class="login-field">
          <span class="login-label">密码</span>
          <NebulaInput
            v-model="password"
            type="password"
            autocomplete="current-password"
            @keydown.enter.prevent="onSubmit"
          />
        </label>

        <p v-if="errorMsg" class="login-error">{{ errorMsg }}</p>

        <NebulaButton
          class="login-submit"
          variant="primary"
          :disabled="busy"
          @click="onSubmit"
        >
          {{ busy ? '登录中…' : '登录' }}
        </NebulaButton>
      </template>

      <template v-else>
        <p class="login-hint">请选择要进入的组织</p>
        <label class="login-field">
          <span class="login-label">组织</span>
          <NebulaSelect
            v-model="selectedOrgId"
            :options="pendingLogin?.organizations ?? []"
            label-key="orgName"
            value-key="id"
            placeholder="请选择组织"
          />
        </label>

        <p v-if="errorMsg" class="login-error">{{ errorMsg }}</p>

        <NebulaButton
          class="login-submit"
          variant="primary"
          :disabled="busy || !selectedOrgId"
          @click="onOrgSubmit"
        >
          {{ busy ? '进入中…' : '进入系统' }}
        </NebulaButton>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  margin: 0;
  font:
    14px/1.5 system-ui,
    sans-serif;
  color: hsl(var(--foreground));
  background: radial-gradient(
    circle at top,
    hsl(var(--background-deep)) 0%,
    hsl(var(--background)) 55%
  );
}

.login-card {
  width: 100%;
  max-width: 360px;
  padding: 28px 24px;
  background: hsl(var(--card) / 92%);
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  box-shadow: 0 20px 50px rgb(0 0 0 / 35%);
}

.login-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
}

.login-hint {
  margin: 0 0 20px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.login-hint code {
  padding: 1px 6px;
  font-size: 11px;
  background: hsl(var(--muted));
  border-radius: 6px;
}

.login-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.login-label {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.login-error {
  margin: 0 0 12px;
  font-size: 12px;
  color: hsl(var(--destructive));
}

.login-submit {
  width: 100%;
  margin-top: 8px;
}
</style>
