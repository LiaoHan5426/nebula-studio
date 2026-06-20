<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';

import AppLayout from '@/app/AppLayout.vue';
import {
  bootstrapAuthFromShell,
  ensureAuthFromShell,
  syncAuthProfile,
} from '@/shared/composables/useAuth';
import { useTenant } from '@/shared/composables/useTenant';
import { hasValidAuthToken } from '@/shared/auth/session';
import {
  isIntegrationShellEmbed,
  isIntegrationShellIframeEmbed,
} from '@/shared/composables/useShellEmbed';
import { SHELL_AUTH_UNAUTHORIZED_EVENT } from '@nebula-studio/app-shell';

const route = useRoute();
const router = useRouter();
const isLoginPage = computed(() => route.path === '/login');
const { loadTenantOptions } = useTenant();

/** 对接租户仅用于 API 上下文，不在控制台 UI 展示 */
async function bootstrapIntegrationContext() {
  if (!hasValidAuthToken()) return;
  await loadTenantOptions();
}

async function requestShellLoginIfNeeded(): Promise<void> {
  if (!isIntegrationShellIframeEmbed()) return;
  await ensureAuthFromShell();
  if (hasValidAuthToken()) return;
  try {
    const parentApi = (
      window.parent as typeof window & {
        api?: { shell?: { openLogin?: () => Promise<void> } };
      }
    ).api;
    await parentApi?.shell?.openLogin?.();
  } catch {
    /* ignore cross-frame access errors */
  }
}

function onShellAuthUnauthorized(): void {
  if (isIntegrationShellIframeEmbed()) return;
  void router.replace({
    path: '/login',
    query: { redirect: route.fullPath },
  });
}

onMounted(async () => {
  window.addEventListener(
    SHELL_AUTH_UNAUTHORIZED_EVENT,
    onShellAuthUnauthorized,
  );
  await ensureAuthFromShell();
  if (
    isIntegrationShellEmbed() &&
    window.parent !== window &&
    window.electron?.ipcRenderer
  ) {
    window.electron.ipcRenderer.on('auth:session-changed', () => {
      void bootstrapAuthFromShell().then(() => syncAuthProfile());
    });
  }
  await requestShellLoginIfNeeded();
  if (
    !isIntegrationShellIframeEmbed() &&
    !hasValidAuthToken() &&
    route.path !== '/login'
  ) {
    await router.replace({
      path: '/login',
      query: { redirect: route.fullPath },
    });
    return;
  }
  await syncAuthProfile();
  await bootstrapIntegrationContext();
});

onUnmounted(() => {
  window.removeEventListener(
    SHELL_AUTH_UNAUTHORIZED_EVENT,
    onShellAuthUnauthorized,
  );
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
