<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { NebulaButton } from '@nebula-studio/nebula-ui';

import { ensureAuthFromShell, useAuth } from '@/shared/composables/useAuth';

const router = useRouter();
const { username, isLoggedIn, isShellHosted, logout } = useAuth();

onMounted(() => {
  void ensureAuthFromShell();
});
</script>

<template>
  <header class="app-header" :class="{ 'app-header--embedded': isShellHosted }">
    <div v-if="!isShellHosted" class="app-header__right">
      <template v-if="isLoggedIn">
        <span class="app-header__user">{{ username }}</span>
        <NebulaButton variant="secondary" @click="logout">退出</NebulaButton>
      </template>
      <NebulaButton v-else @click="router.push('/login')">登录</NebulaButton>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: flex-end;
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

.app-header__right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.app-header__user {
  font-size: 14px;
  color: hsl(var(--foreground));
}
</style>
