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
  // 此处仅做租户上下文初始化；失败不阻断页面渲染
  if (hasValidAuthToken()) {
    try {
      await bootstrapIntegrationContext();
    } catch (e) {
      console.warn('[integration] bootstrap tenant context failed', e);
    }
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

<style lang="scss">
.page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 1200px;
  padding: 16px 20px 20px;
  margin: 0 auto;
}

.page__toolbar,
.page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.page__table-wrap {
  overflow: hidden;
  border: 1px solid hsl(var(--border) / 72%);
  border-radius: 12px;
}

.page__empty {
  padding: 40px 24px;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.page__error,
.page__notice {
  margin: 0;
  font-size: 13px;
}

.page__error {
  color: hsl(var(--destructive));
}

.page__notice {
  color: hsl(var(--muted-foreground));
}

.page__layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.page__layout--split {
  grid-template-columns: minmax(0, 1fr) 280px;
}

.page__detail {
  padding: 12px 14px;
  background: hsl(var(--muted) / 18%);
  border: 1px solid hsl(var(--border) / 72%);
  border-radius: 12px;
}

.page__detail dl {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 8px;
  margin: 0;
  font-size: 13px;
}

.page__detail dt {
  color: hsl(var(--muted-foreground));
}

.page__list {
  display: grid;
  gap: 12px;
}

.page__card {
  padding: 16px;
  background: hsl(var(--muted) / 18%);
  border: 1px solid hsl(var(--border) / 72%);
  border-radius: 10px;
}

.page__card-head {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 12px;
}

.page__card-head h3 {
  font-size: 15px;
  font-weight: 600;
}

.page__meta {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.page__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.page__stats dt {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.page__stats dd {
  margin: 4px 0 0;
  font-size: 13px;
  font-weight: 500;
}

.page__card--active {
  border-color: hsl(var(--primary));
}

.page__card--clickable {
  cursor: pointer;
}

.page__form {
  display: grid;
  gap: 12px;
}

.page__response-body {
  padding: 12px;
  overflow: auto;
  font-size: 12px;
  background: hsl(var(--muted) / 40%);
  border-radius: 6px;
}

.field textarea,
.field__readonly {
  padding: 8px 10px;
  font-family: inherit;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.field__readonly {
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 30%);
}

.page__log-list {
  display: grid;
  gap: 8px;
  padding: 0;
  margin: 12px 0 0;
  list-style: none;
}

.page__log-item {
  display: grid;
  gap: 4px;
  padding: 8px;
  font-size: 12px;
  background: hsl(var(--muted) / 30%);
  border-radius: 6px;
}

.page__log-level {
  font-weight: 600;
}

@media (max-width: 900px) {
  .page__layout {
    grid-template-columns: 1fr;
  }
}

.row-actions,
.page__row-actions {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgb(8 10 18 / 52%);
  backdrop-filter: blur(2px);
}

.modal {
  width: min(480px, 100%);
}

.modal-overlay--full {
  align-items: stretch;
}

.modal--large {
  width: min(96vw, 1200px);
  max-height: 92vh;
  overflow: auto;
}

.modal--dag {
  display: flex;
  flex-direction: column;
  width: min(96vw, 1200px);
  max-height: 92vh;
}

.modal__content--dag {
  flex: 1;
  min-height: 420px;
  overflow: hidden;
}

.field input,
.field select,
.field__select {
  padding: 8px 10px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  font-size: 13px;
}

.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
