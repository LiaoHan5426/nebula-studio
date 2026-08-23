<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  NebulaButton,
  NebulaPageHeader,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import {
  getAuthRoles,
  getAuthUserId,
  getAuthUsername,
} from '@/shared/auth/session';

const { t } = useI18n();
const username = computed(() => getAuthUsername() || t('common.currentUser'));
const userId = computed(() => getAuthUserId() || t('common.unsynced'));
const roles = computed(() => getAuthRoles());
</script>

<template>
  <main class="personal-page">
    <NebulaPageHeader
      :eyebrow="t('profile.eyebrow')"
      :title="t('profile.title')"
      :description="t('profile.description')"
    />
    <section class="profile-card">
      <div class="avatar">{{ username.slice(0, 1).toUpperCase() }}</div>
      <div>
        <span>{{ t('profile.displayName') }}</span>
        <h2>{{ username }}</h2>
        <p>{{ t('profile.userId', { id: userId }) }}</p>
      </div>
      <NebulaButton variant="outline" disabled>
{{
        t('profile.edit')
      }}
</NebulaButton>
    </section>
    <section class="personal-section">
      <h2>{{ t('profile.rolesHeading') }}</h2>
      <p>{{ t('profile.rolesHint') }}</p>
      <div class="role-list">
        <NebulaTag v-for="role in roles" :key="role">{{ role }}</NebulaTag>
        <NebulaTag v-if="roles.length === 0">
{{
          t('profile.member')
        }}
</NebulaTag>
      </div>
    </section>
  </main>
</template>

<style scoped>
.personal-page {
  display: grid;
  gap: var(--space-5);
}

.profile-card,
.personal-section {
  padding: var(--space-5);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
}

.profile-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--space-4);
  align-items: center;
}

.avatar {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  font-size: 24px;
  font-weight: 800;
  color: white;
  background: hsl(var(--primary));
  border-radius: 18px;
}

.profile-card span {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.profile-card h2,
.profile-card p,
.personal-section h2 {
  margin: 4px 0 0;
}

.profile-card p,
.personal-section p {
  color: hsl(var(--muted-foreground));
}

.role-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

@media (width <= 600px) {
  .profile-card {
    grid-template-columns: auto 1fr;
  }
}
</style>
