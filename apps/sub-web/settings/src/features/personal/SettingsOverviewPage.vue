<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import { NebulaPageHeader, NebulaTag } from '@nebula-studio/nebula-ui';

import { canAccessSettings } from '@/shared/auth/access';
import { getAuthRoles, getAuthUsername } from '@/shared/auth/session';

const { t } = useI18n();
const username = computed(() => getAuthUsername() || t('common.currentUser'));
const roles = computed(() => getAuthRoles());
const destinations = computed(() => [
  {
    to: '/profile',
    code: '01',
    title: t('nav.profile'),
    description: t('pages.profile.description'),
    meta: username.value,
  },
  {
    to: '/sessions',
    code: '02',
    title: t('nav.sessions'),
    description: t('pages.sessions.description'),
    meta: t('sessions.currentTag'),
  },
  {
    to: '/appearance',
    code: '03',
    title: t('nav.appearance'),
    description: t('pages.appearance.description'),
    meta: t('appearance.preview'),
  },
  {
    to: '/language',
    code: '04',
    title: t('nav.language'),
    description: t('pages.language.description'),
    meta: 'zh-CN / en-US',
  },
]);
</script>

<template>
  <main class="settings-overview">
    <NebulaPageHeader
      eyebrow="Settings workspace"
      :title="t('overview.title', { user: username })"
      :description="t('overview.description')"
    />

    <section class="account-strip" aria-label="账户状态">
      <div class="account-strip__identity">
        <span class="account-strip__avatar">{{
          username.slice(0, 1).toUpperCase()
        }}</span>
        <div>
          <span>{{ t('profile.displayName') }}</span>
          <strong>{{ username }}</strong>
        </div>
      </div>
      <div class="account-strip__meta">
        <span>{{ t('profile.rolesHeading') }}</span>
        <div>
          <NebulaTag v-for="role in roles" :key="role">{{ role }}</NebulaTag>
          <NebulaTag v-if="roles.length === 0">{{
            t('profile.member')
          }}</NebulaTag>
        </div>
      </div>
      <RouterLink v-if="canAccessSettings('organization')" to="/governance">
        {{ t('nav.governanceHome') }} →
      </RouterLink>
    </section>

    <section class="settings-overview__section">
      <header>
        <div>
          <span>Personal preferences</span>
          <h2>{{ t('overview.personalTitle') }}</h2>
        </div>
        <p>{{ t('overview.personalHint') }}</p>
      </header>
      <div class="destination-list">
        <RouterLink v-for="item in destinations" :key="item.to" :to="item.to">
          <span class="destination-list__code">{{ item.code }}</span>
          <div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.description }}</p>
          </div>
          <span class="destination-list__meta">{{ item.meta }}</span>
          <span aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.settings-overview {
  display: grid;
  gap: var(--space-6);
}
.account-strip {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(14rem, 0.7fr) auto;
  gap: var(--space-5);
  align-items: center;
  padding: var(--space-5) 0;
  border-block: 1px solid hsl(var(--border));
}
.account-strip__identity {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}
.account-strip__avatar {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  font-weight: 800;
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
  border-radius: var(--radius-md);
}
.account-strip__identity div,
.account-strip__meta {
  display: grid;
  gap: 4px;
}
.account-strip span,
.settings-overview__section header > div > span {
  font-size: 11px;
  font-weight: 700;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.account-strip__meta div {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}
.account-strip > a {
  font-weight: 650;
  color: hsl(var(--primary));
  text-decoration: none;
}
.settings-overview__section > header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(16rem, 0.65fr);
  gap: var(--space-6);
  align-items: end;
  margin-bottom: var(--space-4);
}
.settings-overview__section h2 {
  margin: 4px 0 0;
  font-size: 20px;
}
.settings-overview__section header p {
  margin: 0;
  color: hsl(var(--muted-foreground));
}
.destination-list {
  border-top: 1px solid hsl(var(--border));
}
.destination-list a {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr) auto auto;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-4) var(--space-2);
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid hsl(var(--border));
  transition: background var(--motion-fast) ease;
}
.destination-list a:hover {
  background: hsl(var(--accent) / 55%);
}
.destination-list__code,
.destination-list__meta {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}
.destination-list strong {
  font-size: 15px;
}
.destination-list p {
  margin: 3px 0 0;
  color: hsl(var(--muted-foreground));
}
@media (width <= 760px) {
  .account-strip,
  .settings-overview__section > header {
    grid-template-columns: 1fr;
  }
  .destination-list a {
    grid-template-columns: 2rem minmax(0, 1fr) auto;
  }
  .destination-list__meta {
    display: none;
  }
}
</style>
