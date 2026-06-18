<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NebulaButton } from '@nebula-studio/nebula-ui';

import LoginPanel from '@/features/auth/LoginPanel.vue';
import { ensureAuthFromShell, useAuth } from '@/shared/composables/useAuth';
import { useTenant } from '@/shared/composables/useTenant';

const { username, isLoggedIn, isShellHosted, logout } = useAuth();
const { currentTenantName, refreshCurrent } = useTenant();

const showLogin = ref(false);

onMounted(async () => {
  await ensureAuthFromShell();
  await refreshCurrent();
});
</script>

<template>
  <header class="app-header" :class="{ 'app-header--embedded': isShellHosted }">
    <div class="app-header__left">
      <span class="app-header__tenant-name">{{ currentTenantName }}</span>
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

.app-header__tenant-name {
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--foreground));
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
