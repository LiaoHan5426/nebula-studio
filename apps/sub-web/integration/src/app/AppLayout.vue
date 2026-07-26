<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import {
  NebulaAdminVerticalNav,
  NebulaSurfaceLayout,
  useShellHosted,
} from '@nebula-studio/nebula-layout';
import { NebulaButton } from '@nebula-studio/nebula-ui';

import {
  expandedMenuForPath,
  homeForSurface,
  platformAdminNavItems,
  portalNavItems,
  resolveIntegrationSurface,
  userManageNavItems,
} from '@/app/navigation';
import { useAuth } from '@/shared/composables/useAuth';

const route = useRoute();
const router = useRouter();
const { isShellHosted } = useShellHosted();
const { isPlatformAdmin, isLoggedIn, username, logout } = useAuth();

const surface = computed(() =>
  resolveIntegrationSurface(route.meta.surface, isPlatformAdmin.value),
);
const managementNavItems = computed(() =>
  isPlatformAdmin.value ? platformAdminNavItems : userManageNavItems,
);
const activeNavItems = computed(() =>
  surface.value === 'portal' ? portalNavItems : managementNavItems.value,
);
const surfaceTitle = computed(() =>
  surface.value === 'portal'
    ? '资源门户'
    : surface.value === 'admin'
      ? '平台管理中心'
      : '提供方工作台',
);
const surfaceDescription = computed(() =>
  surface.value === 'portal'
    ? '查找、申请并使用组织内可用的数据、服务与连接能力'
    : surface.value === 'admin'
      ? '统一管理平台资源、租户与运行状态'
      : '创建并管理你的服务、数据源与集成流程',
);
const switchLabel = computed(() =>
  surface.value === 'portal' ? '进入管理工作台' : '返回资源门户',
);

const expandedMenus = ref<Set<string>>(new Set());

watch(
  [() => route.path, activeNavItems],
  ([path, items]) => {
    expandedMenus.value = expandedMenuForPath(items, path);
  },
  { immediate: true },
);

function switchSurface(): void {
  const target =
    surface.value === 'portal'
      ? isPlatformAdmin.value
        ? 'admin'
        : 'provider'
      : 'portal';
  void router.push(homeForSurface(target, isPlatformAdmin.value));
}
</script>

<template>
  <NebulaSurfaceLayout
    :surface="surface"
    :density="surface === 'portal' ? 'comfortable' : 'compact'"
    content-width="full"
    :embedded="isShellHosted"
    :title="surfaceTitle"
    :description="surfaceDescription"
    eyebrow="Nebula Integration"
    navigation-label="Integration 导航"
    class="integration-root"
  >
    <template #navigation>
      <div class="integration-subnav">
        <div class="surface-summary">
          <div class="surface-summary__mark" aria-hidden="true">N</div>
          <div class="surface-summary__copy">
            <span class="surface-summary__eyebrow">集成平台</span>
            <strong>{{ surfaceTitle }}</strong>
          </div>
        </div>

        <nav
          v-if="surface === 'portal'"
          class="portal-nav"
          aria-label="资源门户导航"
        >
          <RouterLink
            v-for="item in portalNavItems"
            :key="item.key"
            :to="item.to!"
            class="portal-nav__item"
            active-class="is-active"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
        <NebulaAdminVerticalNav
          v-else
          v-model="expandedMenus"
          :items="activeNavItems"
        />
      </div>
    </template>

    <template #actions>
      <div v-if="!isShellHosted && isLoggedIn" class="integration-user">
        <span class="integration-user__avatar" aria-hidden="true">
          {{ username?.slice(0, 1).toUpperCase() }}
        </span>
        <span>{{ username }}</span>
        <NebulaButton size="sm" variant="outline" @click="logout">
          退出登录
        </NebulaButton>
      </div>
      <NebulaButton
        v-else-if="!isShellHosted"
        size="sm"
        @click="router.push('/login')"
      >
        登录
      </NebulaButton>
      <NebulaButton variant="outline" size="sm" @click="switchSurface">
        {{ switchLabel }}
      </NebulaButton>
    </template>

    <slot />
  </NebulaSurfaceLayout>
</template>

<style scoped>
.integration-root,
.integration-subnav {
  height: 100%;
  min-height: 0;
}

.integration-subnav {
  display: flex;
  flex-direction: column;
}

.surface-summary {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 10px;
  padding: 18px 16px 14px;
  border-bottom: 1px solid hsl(var(--border) / 68%);
}

.surface-summary__mark {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  font-weight: 800;
  color: white;
  background: linear-gradient(145deg, hsl(var(--primary)), #7c5cff);
  border-radius: 11px;
  box-shadow: 0 8px 20px hsl(var(--primary) / 24%);
}

.surface-summary__copy {
  min-width: 0;
}

.surface-summary__eyebrow {
  display: block;
  margin-bottom: 3px;
  font-size: 10px;
  font-weight: 700;
  color: hsl(var(--primary));
  text-transform: uppercase;
  letter-spacing: 0.09em;
}

.surface-summary strong {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.015em;
}

.portal-nav {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3);
}

.portal-nav__item {
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-body);
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
}

.portal-nav__item:hover,
.portal-nav__item.is-active {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 10%);
  border-color: hsl(var(--primary) / 18%);
}

.integration-user {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  font-size: var(--font-size-caption);
}

.integration-user__avatar {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  font-weight: 700;
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
  border-radius: 50%;
}
</style>
