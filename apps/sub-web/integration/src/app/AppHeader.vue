<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { NebulaButton, NebulaSelect } from '@nebula-studio/nebula-ui';

import LoginPanel from '@/features/auth/LoginPanel.vue';
import { ensureAuthFromShell, useAuth } from '@/shared/composables/useAuth';
import { useTenant } from '@/shared/composables/useTenant';

const { username, isLoggedIn, isShellHosted, logout } = useAuth();
const { currentTenantId, availableTenants, switchTenant, refreshCurrent } =
  useTenant();

const showLogin = ref(false);

const tenantOptions = computed(() =>
  availableTenants.value.map((id: string) => ({ label: id, value: id })),
);

onMounted(async () => {
  await ensureAuthFromShell();
  await refreshCurrent();
});

async function onTenantChange(value: unknown) {
  if (typeof value === 'string') {
    await switchTenant(value);
  }
}
</script>

<template>
  <header class="app-header" :class="{ 'app-header--embedded': isShellHosted }">
    <div class="app-header__left">
      <span class="app-header__label">租户</span>
      <NebulaSelect
        :model-value="currentTenantId"
        :options="tenantOptions"
        class="app-header__tenant-select"
        @update:model-value="onTenantChange"
      />
    </div>

    <!-- Web 壳已统一登录，embed 模式不再展示独立登录入口 -->
    <div v-if="!isShellHosted" class="app-header__right">
      <template v-if="isLoggedIn">
        <span class="app-header__user">{{ username }}</span>
        <NebulaButton variant="secondary" @click="logout">退出</NebulaButton>
      </template>
      <NebulaButton v-else @click="showLogin = true">登录</NebulaButton>
    </div>

    <div
      v-if="!isShellHosted && showLogin"
      class="app-header__overlay"
      @click.self="showLogin = false"
    >
      <LoginPanel @close="showLogin = false" @success="showLogin = false" />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: hsl(var(--card));
  border-bottom: 1px solid hsl(var(--border));
}

.app-header--embedded {
  justify-content: flex-start;
  padding: 10px 16px;
  background: transparent;
  border-bottom: none;
}

.app-header__left,
.app-header__right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.app-header__label {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.app-header__tenant-select {
  min-width: 140px;
}

.app-header__user {
  font-size: 14px;
  color: hsl(var(--foreground));
}

.app-header__overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 45%);
}
</style>
