<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import { NebulaPageHeader, NebulaTag } from '@nebula-studio/nebula-ui';

import {
  isSettingsOrgAdmin,
  isSettingsPlatformAdmin,
} from '@/shared/auth/access';

const { t } = useI18n();
const platformAdmin = isSettingsPlatformAdmin();
const organizationAdmin = isSettingsOrgAdmin();
const tasks = computed(() =>
  [
    {
      to: '/organization/users',
      title: t('governance.usersTitle'),
      description: t('governance.usersDesc'),
      visible: organizationAdmin,
      scope: t('governance.usersScope'),
    },
    {
      to: '/access/roles',
      title: t('governance.rolesTitle'),
      description: t('governance.rolesDesc'),
      visible: organizationAdmin,
      scope: t('governance.rolesScope'),
    },
    {
      to: '/platform/config',
      title: t('governance.configTitle'),
      description: t('governance.configDesc'),
      visible: platformAdmin,
      scope: t('governance.configScope'),
    },
    {
      to: '/platform/audit',
      title: t('governance.logsTitle'),
      description: t('governance.logsDesc'),
      visible: platformAdmin,
      scope: t('governance.logsScope'),
    },
  ].filter((task) => task.visible),
);
</script>

<template>
  <main class="governance-home">
    <NebulaPageHeader
      :eyebrow="t('governance.eyebrow')"
      :title="t('governance.title')"
      :description="t('governance.description')"
    />

    <section class="summary-grid" :aria-label="t('governance.scopeAria')">
      <article>
        <span>{{ t('governance.roleScope') }}</span>
        <strong>{{
          platformAdmin
            ? t('governance.platformAdmin')
            : t('governance.orgAdmin')
        }}</strong>
        <p>{{ t('governance.roleHint') }}</p>
      </article>
      <article>
        <span>{{ t('governance.today') }}</span>
        <strong>{{ tasks.length }}</strong>
        <p>{{ t('governance.todayHint') }}</p>
      </article>
      <article>
        <span>{{ t('governance.personal') }}</span>
        <strong>{{ t('governance.personalAlways') }}</strong>
        <p>{{ t('governance.personalHint') }}</p>
      </article>
    </section>

    <section class="task-panel">
      <header>
        <div>
          <span>Next actions</span>
          <h2>{{ t('governance.next') }}</h2>
        </div>
        <NebulaTag>{{ t('governance.count', { n: tasks.length }) }}</NebulaTag>
      </header>
      <div class="task-list">
        <RouterLink v-for="task in tasks" :key="task.to" :to="task.to">
          <div>
            <strong>{{ task.title }}</strong>
            <p>{{ task.description }}</p>
          </div>
          <NebulaTag>{{ task.scope }}</NebulaTag>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.governance-home {
  display: grid;
  gap: var(--space-5);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}

.summary-grid article,
.task-panel {
  padding: var(--space-5);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
}

.summary-grid span,
.task-panel header span {
  font-size: 11px;
  font-weight: 800;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.summary-grid strong {
  display: block;
  margin-top: var(--space-2);
  font-size: 24px;
}

.summary-grid p,
.task-list p {
  margin: var(--space-2) 0 0;
  color: hsl(var(--muted-foreground));
}

.task-panel header,
.task-list a {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
}

.task-panel h2 {
  margin: var(--space-1) 0 0;
}

.task-list {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.task-list a {
  padding: var(--space-4);
  color: inherit;
  text-decoration: none;
  background: hsl(var(--muted) / 28%);
  border-radius: var(--radius-md);
}

.task-list a:hover {
  background: hsl(var(--muted) / 48%);
}

@media (width <= 800px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
