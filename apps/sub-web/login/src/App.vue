<script setup lang="ts">
import {
  isSafeAuthReturnUrl,
  isWebPresentationHost,
} from '@nebula-studio/app-shell';
import { NebulaButton } from '@nebula-studio/nebula-ui';
import { ref } from 'vue';

const user = ref('');
const password = ref('');
const errorMsg = ref('');
const busy = ref(false);

async function onSubmit(): Promise<void> {
  errorMsg.value = '';
  busy.value = true;
  try {
    await window.api.auth.login({
      user: user.value,
      password: password.value,
    });
    if (isWebPresentationHost()) {
      const ret = new URLSearchParams(location.search).get('return');
      const fallback = new URL('index.html', location.href).toString();
      const target = ret && isSafeAuthReturnUrl(ret) ? ret : fallback;
      location.href = target;
      return;
    }
    window.close();
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
      <p class="login-hint">演示账号：任意用户名，密码 <code>demo</code></p>

      <label class="login-field">
        <span class="login-label">用户名</span>
        <input
          v-model="user"
          class="login-input"
          type="text"
          autocomplete="username"
          @keydown.enter.prevent="onSubmit"
        />
      </label>
      <label class="login-field">
        <span class="login-label">密码</span>
        <input
          v-model="password"
          class="login-input"
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

.login-input {
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  color: hsl(var(--foreground));
  outline: none;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
}

.login-input:focus {
  border-color: hsl(var(--primary) / 70%);
  box-shadow: 0 0 0 2px hsl(var(--primary) / 25%);
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
