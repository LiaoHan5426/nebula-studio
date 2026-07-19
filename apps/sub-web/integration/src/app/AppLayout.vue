<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  NebulaAdminContent,
  NebulaAdminVerticalNav,
  useShellHosted,
} from '@nebula-studio/nebula-layout';
import { NebulaButton } from '@nebula-studio/nebula-ui';

import AppHeader from '@/app/AppHeader.vue';
import {
  expandedMenuForPath,
  homeForSurface,
  platformAdminNavItems,
  portalNavItems,
  surfaceForPath,
  userManageNavItems,
} from '@/app/navigation';
import { useAuth } from '@/shared/composables/useAuth';

const route = useRoute();
const router = useRouter();
const { isShellHosted } = useShellHosted();
const { isPlatformAdmin } = useAuth();

const surface = computed(() => surfaceForPath(route.path));
const managementNavItems = computed(() =>
  isPlatformAdmin.value ? platformAdminNavItems : userManageNavItems,
);
const activeNavItems = computed(() =>
  surface.value === 'portal' ? portalNavItems : managementNavItems.value,
);
const surfaceTitle = computed(() =>
  surface.value === 'portal'
    ? '应用工作台'
    : isPlatformAdmin.value
      ? '平台管理中心'
      : '我的管理中心',
);
const surfaceDescription = computed(() =>
  surface.value === 'portal'
    ? '订阅、使用并查看属于你的集成服务'
    : isPlatformAdmin.value
      ? '统一管理平台资源、租户与运行状态'
      : '管理你的服务、数据源与集成流程',
);
const switchLabel = computed(() =>
  surface.value === 'portal' ? '进入管理中心' : '返回应用工作台',
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
  const target = surface.value === 'portal' ? 'manage' : 'portal';
  void router.push(homeForSurface(target, isPlatformAdmin.value));
}
</script>

<template>
  <NebulaAdminContent
    v-if="isShellHosted"
    horizontal
    class="integration-embed-root"
  >
    <template #subnav>
      <div class="integration-subnav">
        <div class="surface-summary surface-summary--embedded">
          <span class="surface-summary__eyebrow">集成平台</span>
          <strong>{{ surfaceTitle }}</strong>
          <NebulaButton variant="outline" size="sm" @click="switchSurface">
            {{ switchLabel }}
          </NebulaButton>
        </div>
        <NebulaAdminVerticalNav
          v-model="expandedMenus"
          :items="activeNavItems"
        />
      </div>
    </template>
    <slot />
  </NebulaAdminContent>

  <div v-else class="app-layout">
    <aside class="app-layout__sidebar">
      <div class="surface-summary">
        <div class="surface-summary__mark" aria-hidden="true">N</div>
        <div class="surface-summary__copy">
          <span class="surface-summary__eyebrow">Nebula Integration</span>
          <h1>{{ surfaceTitle }}</h1>
          <p>{{ surfaceDescription }}</p>
        </div>
        <NebulaButton
          class="surface-summary__switch"
          variant="outline"
          size="sm"
          @click="switchSurface"
        >
          {{ switchLabel }}
        </NebulaButton>
      </div>

      <NebulaAdminVerticalNav
        v-model="expandedMenus"
        :items="activeNavItems"
        class="app-layout__nav"
      />
    </aside>
    <div class="app-layout__main">
      <AppHeader :surface-title="surfaceTitle" />
      <main class="app-layout__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.integration-embed-root,
.integration-subnav {
  height: 100%;
  min-height: 0;
}

.integration-subnav {
  display: flex;
  flex-direction: column;
}

.app-layout {
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 0;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
}

.app-layout__sidebar {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  width: 256px;
  min-height: 0;
  overflow: hidden;
  background: hsl(var(--sidebar));
  border-right: 1px solid hsl(var(--border) / 72%);
  box-shadow: 8px 0 28px hsl(var(--foreground) / 3%);
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

.surface-summary h1,
.surface-summary strong {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.015em;
}

.surface-summary p {
  margin: 4px 0 0;
  font-size: 11px;
  line-height: 1.45;
  color: hsl(var(--muted-foreground));
}

.surface-summary__switch {
  grid-column: 1 / -1;
  width: 100%;
  margin-top: 3px;
}

.surface-summary--embedded {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 14px 12px 12px;
}

.surface-summary--embedded strong {
  margin-bottom: 4px;
}

.app-layout__nav {
  flex: 1;
  min-height: 0;
}

.app-layout__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.app-layout__content {
  flex: 1;
  min-height: 0;
  padding: 22px 26px 28px;
  overflow: auto;
  background:
    radial-gradient(
      circle at 95% 0%,
      hsl(var(--primary) / 5%),
      transparent 26rem
    ),
    hsl(var(--background));
}

:global(html[data-platform='electron']) .app-layout__sidebar {
  width: 232px;
  box-shadow: none;
}

:global(html[data-platform='electron']) .surface-summary {
  padding: 14px 12px 11px;
}

:global(html[data-platform='electron']) .app-layout__content {
  padding: 14px 18px 18px;
  background: hsl(var(--background));
}
</style>
