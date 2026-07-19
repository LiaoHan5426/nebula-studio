<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { NebulaButton } from '@nebula-studio/nebula-ui';

import { useAuth } from '@/shared/composables/useAuth';

defineProps<{ surfaceTitle?: string }>();

const route = useRoute();
const router = useRouter();
const { username, isLoggedIn, isShellHosted, logout } = useAuth();
</script>

<template>
  <header class="app-header" :class="{ 'app-header--embedded': isShellHosted }">
    <div class="app-header__context">
      <span>{{ surfaceTitle }}</span>
      <span class="app-header__separator">/</span>
      <strong>{{ route.meta.title }}</strong>
    </div>
    <div v-if="!isShellHosted" class="app-header__right">
      <template v-if="isLoggedIn">
        <span class="app-header__avatar" aria-hidden="true">
          {{ username?.slice(0, 1).toUpperCase() }}
        </span>
        <span class="app-header__user">{{ username }}</span>
        <NebulaButton size="sm" variant="outline" @click="logout">
          退出登录
        </NebulaButton>
      </template>
      <NebulaButton v-else size="sm" @click="router.push('/login')">
        登录
      </NebulaButton>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  flex-shrink: 0;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  padding: 10px 26px;
  background: hsl(var(--card) / 86%);
  border-bottom: 1px solid hsl(var(--border) / 68%);
  backdrop-filter: blur(14px);
}

.app-header__context,
.app-header__right {
  display: flex;
  gap: 9px;
  align-items: center;
}

.app-header__context {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.app-header__context strong {
  font-weight: 650;
  color: hsl(var(--foreground));
}

.app-header__separator {
  opacity: 0.48;
}

.app-header__avatar {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  font-size: 12px;
  font-weight: 700;
  color: hsl(var(--primary-foreground));
  background: linear-gradient(145deg, hsl(var(--primary)), #7c5cff);
  border-radius: 50%;
}

.app-header__user {
  font-size: 13px;
  font-weight: 550;
}

.app-header--embedded {
  min-height: 0;
  padding: 0;
  background: transparent;
  border: 0;
}

:global(html[data-platform='electron']) .app-header {
  min-height: 48px;
  padding: 7px 18px;
  backdrop-filter: none;
}
</style>
