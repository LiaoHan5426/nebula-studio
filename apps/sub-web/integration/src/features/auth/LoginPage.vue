<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import LoginPanel from '@/features/auth/LoginPanel.vue';
import { hasValidAuthToken, clearAuthSession } from '@/shared/auth/session';
import { useTenant } from '@/shared/composables/useTenant';

const router = useRouter();
const route = useRoute();
const { resetTenantSession, loadTenantOptions } = useTenant();

onMounted(() => {
  if (!hasValidAuthToken()) {
    clearAuthSession();
  }
});

async function onSuccess() {
  resetTenantSession();
  await loadTenantOptions();
  const redirect =
    typeof route.query.redirect === 'string' &&
    route.query.redirect.startsWith('/')
      ? route.query.redirect
      : '/statistics/log-query';
  router.replace(redirect);
}
</script>

<template>
  <div class="login-page">
    <div class="login-page__brand">
      <h1 class="login-page__title">集成平台</h1>
      <p class="login-page__subtitle">连接器 · 订阅 · 接口 · 流程</p>
    </div>
    <LoginPanel mode="page" @success="onSuccess" />
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  min-height: 0;
  padding: 24px;
  overflow: auto;
  background: hsl(var(--background));
}

.login-page__brand {
  text-align: center;
}

.login-page__title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
}

.login-page__subtitle {
  margin: 0;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}
</style>
