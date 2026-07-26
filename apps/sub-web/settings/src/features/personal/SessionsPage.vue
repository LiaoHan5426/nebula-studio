<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  NebulaButton,
  NebulaPageHeader,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { clearAuthSession, getAuthUsername } from '@/shared/auth/session';
import { useConfirm } from '@/shared/composables/useConfirm';

const router = useRouter();
const username = computed(() => getAuthUsername() || '当前用户');

async function endSession(): Promise<void> {
  const confirmed = await useConfirm('结束当前会话后需要重新登录。是否继续？');
  if (!confirmed) return;
  clearAuthSession();
  await router.replace('/login');
}
</script>

<template>
  <main class="sessions-page">
    <NebulaPageHeader
      eyebrow="Security"
      title="登录会话"
      description="查看当前设备会话并在发现异常时立即退出。"
    />
    <section class="session-card">
      <div class="session-icon">●</div>
      <div>
        <h2>当前设备</h2>
        <p>{{ username }} · Web / Desktop 当前实例</p>
        <span>最近活动：刚刚</span>
      </div>
      <NebulaTag>当前会话</NebulaTag>
      <NebulaButton variant="outline" @click="endSession">
        结束会话
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
