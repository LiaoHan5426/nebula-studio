<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import {
  NebulaButton,
  NebulaPageHeader,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { clearAuthSession, getAuthUsername } from '@/shared/auth/session';
import { useConfirm } from '@/shared/composables/useConfirm';

const { t } = useI18n();
const router = useRouter();
const username = computed(() => getAuthUsername() || t('common.currentUser'));

async function endSession(): Promise<void> {
  const confirmed = await useConfirm(t('sessions.confirm'));
  if (!confirmed) return;
  clearAuthSession();
  await router.replace('/login');
}
</script>

<template>
  <main class="sessions-page">
    <NebulaPageHeader
      :eyebrow="t('sessions.eyebrow')"
      :title="t('sessions.title')"
      :description="t('sessions.description')"
    />
    <section class="session-card">
      <div class="session-icon">●</div>
      <div>
        <h2>{{ t('sessions.currentDevice') }}</h2>
        <p>{{ t('sessions.instance', { user: username }) }}</p>
        <span>{{ t('sessions.recent') }}</span>
      </div>
      <NebulaTag>{{ t('sessions.currentTag') }}</NebulaTag>
      <NebulaButton variant="outline" @click="endSession">
        {{ t('sessions.end') }}
      </NebulaButton>
    </section>
  </main>
</template>

<style scoped>
.sessions-page {
  display: grid;
  gap: var(--space-5);
}

.session-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-5);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
}

.session-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  color: hsl(var(--success, 145 60% 40%));
  background: hsl(var(--success, 145 60% 40%) / 12%);
  border-radius: 50%;
}

.session-card h2,
.session-card p {
  margin: 0;
}

.session-card p,
.session-card span {
  color: hsl(var(--muted-foreground));
}

.session-card span {
  font-size: 12px;
}

@media (width <= 680px) {
  .session-card {
    grid-template-columns: auto 1fr;
  }
}
</style>
