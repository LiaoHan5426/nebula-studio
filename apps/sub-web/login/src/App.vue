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

async function finishLogin(result: BackendLoginResult): Promise<void> {
  const { username, token, roles, userId } = result;
  const session = {
    user: username,
    token,
    roles,
    userId: userId === undefined ? undefined : String(userId),
  };

  if (isWebPresentationHost()) {
    writeWebAuthSession(session);
    const params = new URLSearchParams(location.search);
    const requestedReturn = params.get('return') ?? params.get('redirect');
    const fallback = new URL('index.html', location.href).toString();
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
          user: string;
          token: string;
          roles?: string[];
          userId?: string;
        }) => Promise<boolean>;
      };
    };
  };
  if (
    typeof electronWindow.api?.auth?.establishSession === 'function' &&
    token
  ) {
    await electronWindow.api.auth.establishSession({
      ...session,
      token,
    });
    return;
  }

  writeWebAuthSession(session);
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
    await finishLogin(result);
  } catch (error) {
    errorMsg.value = error instanceof Error ? error.message : String(error);
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
    await finishLogin({
      ...pendingLogin.value,
      ...completed,
      username: completed.username || pendingLogin.value.username,
      token: completed.token ?? pendingLogin.value.token,
    });
  } catch (error) {
    errorMsg.value = error instanceof Error ? error.message : String(error);
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-shell">
      <div class="login-brand" aria-hidden="true">
        <div class="login-brand__logo">N</div>
        <p class="login-brand__eyebrow">Nebula Studio</p>
        <h1>连接数据、服务与流程</h1>
        <p class="login-brand__description">
          一个入口完成集成开发、服务订阅与运行管理。
        </p>
        <div class="login-brand__features">
          <span>统一集成工作台</span>
          <span>按角色进入对应前台</span>
          <span>安全的租户级管理</span>
        </div>
      </div>

      <div class="login-panel">
        <div class="login-panel__heading">
          <span class="login-panel__badge">欢迎回来</span>
          <h2>{{ step === 'credentials' ? '登录 Nebula' : '选择组织' }}</h2>
          <p>
            {{
              step === 'credentials'
                ? '管理员将进入平台管理中心，普通用户将进入应用工作台。'
                : '选择本次登录要使用的组织空间。'
            }}
          </p>
        </div>

        <form v-if="step === 'credentials'" @submit.prevent="onSubmit">
          <label class="login-field">
            <span>用户名</span>
            <NebulaInput
              v-model="user"
              type="text"
              autocomplete="username"
              placeholder="请输入用户名"
            />
          </label>
          <label class="login-field">
            <span>密码</span>
            <NebulaInput
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="请输入密码"
            />
          </label>

          <p v-if="errorMsg" class="login-error" role="alert">
            {{ errorMsg }}
          </p>

          <NebulaButton
            class="login-submit"
            type="submit"
            variant="primary"
            :disabled="busy"
          >
            {{ busy ? '正在登录…' : '登录' }}
          </NebulaButton>
          <p class="login-demo">演示账号：demo / demo 或 admin / admin123</p>
        </form>

        <form v-else @submit.prevent="onOrgSubmit">
          <label class="login-field">
            <span>组织</span>
            <NebulaSelect
              v-model="selectedOrgId"
              :options="pendingLogin?.organizations ?? []"
              label-key="orgName"
              value-key="id"
              placeholder="请选择组织"
            />
          </label>
          <p v-if="errorMsg" class="login-error" role="alert">
            {{ errorMsg }}
          </p>
          <NebulaButton
            class="login-submit"
            type="submit"
            variant="primary"
            :disabled="busy || !selectedOrgId"
          >
            {{ busy ? '正在进入…' : '进入系统' }}
          </NebulaButton>
        </form>
      </div>
    </section>
  </main>
</template>

<style lang="scss" scoped>
.login-page {
  box-sizing: border-box;
  display: grid;
  min-height: 100vh;
  padding: clamp(24px, 5vw, 72px);
  font:
    14px/1.5 Inter,
    'Segoe UI',
    system-ui,
    sans-serif;
  color: hsl(var(--foreground));
  background:
    radial-gradient(
      circle at 14% 12%,
      hsl(var(--primary) / 14%),
      transparent 30rem
    ),
    radial-gradient(circle at 88% 86%, #7c5cff1a, transparent 28rem),
    hsl(var(--background-deep));
}

.login-shell {
  display: grid;
  grid-template-columns: minmax(340px, 1.15fr) minmax(340px, 0.85fr);
  width: min(960px, 100%);
  min-height: 540px;
  margin: auto;
  overflow: hidden;
  background: hsl(var(--card) / 82%);
  border: 1px solid hsl(var(--border) / 72%);
  border-radius: 24px;
  box-shadow: 0 28px 90px hsl(var(--foreground) / 14%);
  backdrop-filter: blur(22px);
}

.login-brand {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 64px;
  overflow: hidden;
  color: white;
  background:
    linear-gradient(145deg, rgb(31 54 134 / 96%), rgb(78 55 160 / 94%)),
    hsl(var(--primary));
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

.login-panel {
  align-self: center;
  padding: 56px 48px;
}

.login-panel__heading {
  margin-bottom: 30px;
}

.login-panel__badge {
  display: inline-block;
  padding: 4px 9px;
  margin-bottom: 15px;
  font-size: 11px;
  font-weight: 700;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 10%);
  border-radius: 999px;
}

.login-panel h2 {
  margin: 0 0 9px;
  font-size: 27px;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.login-panel__heading p,
.login-demo {
  margin: 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
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

.login-error {
  padding: 9px 11px;
  margin: 0 0 13px;
  font-size: 12px;
  color: hsl(var(--destructive));
  background: hsl(var(--destructive) / 9%);
  border: 1px solid hsl(var(--destructive) / 20%);
  border-radius: 8px;
}

.login-submit {
  width: 100%;
  margin-top: 5px;
}

.login-demo {
  margin-top: 15px;
  text-align: center;
}

:global(html[data-platform='electron']) .login-page {
  display: flex;
  align-items: stretch;
  min-height: 100vh;
  padding: 0;
  background: hsl(var(--background));
}

:global(html[data-platform='electron']) .login-shell {
  display: block;
  width: 100%;
  min-height: 100vh;
  margin: 0;
  overflow-y: auto;
  background: hsl(var(--background));
  border: 0;
  border-radius: 0;
  box-shadow: none;
  backdrop-filter: none;
}

:global(html[data-platform='electron']) .login-brand {
  display: none;
}

:global(html[data-platform='electron']) .login-panel {
  width: 100%;
  padding: 46px 30px 30px;
}

:global(html[data-platform='electron']) .login-panel__heading {
  margin-bottom: 24px;
}

:global(html[data-platform='electron']) .login-panel h2 {
  font-size: 23px;
}

@media (max-width: 760px) {
  .login-page {
    padding: 18px;
  }

  .login-shell {
    display: block;
    min-height: auto;
  }

  .login-brand {
    display: none;
  }

  .login-panel {
    padding: 38px 30px;
  }
}
</style>
