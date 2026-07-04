<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterView, useRoute } from 'vue-router';

import AppLayout from '@/app/AppLayout.vue';
import { useTenant } from '@/shared/composables/useTenant';
import { hasValidAuthToken } from '@/shared/auth/session';

const route = useRoute();
const isLoginPage = computed(() => route.path === '/login');
const { loadTenantOptions } = useTenant();

/** 对接租户仅用于 API 上下文，不在控制台 UI 展示 */
async function bootstrapIntegrationContext() {
  if (!hasValidAuthToken()) return;
  await loadTenantOptions();
}

onMounted(async () => {
  // Auth 已由 AuthBootstrap 统一处理（boot.ts → auth: { enabled: true }）
  // 此处仅做租户上下文初始化
  if (hasValidAuthToken()) {
    await bootstrapIntegrationContext();
  }
});
</script>

<template>
  <RouterView v-if="isLoginPage" />
  <AppLayout v-else>
    <RouterView />
  </AppLayout>
</template>

<style>
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  height: 100%;
  overflow: hidden;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
}

#app {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 100dvh;
  overflow: hidden;
}

/* ConfigProvider 等根级包装层需占满视口，否则子页面 height:100% 无法形成滚动容器 */
#app > * {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
</style>
