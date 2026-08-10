<script setup lang="ts">
import { computed } from 'vue';

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

const username = computed(() => getAuthUsername() || '当前用户');
const userId = computed(() => getAuthUserId() || '未同步');
const roles = computed(() => getAuthRoles());
</script>

<template>
  <main class="personal-page">
    <NebulaPageHeader
      eyebrow="Personal settings"
      title="个人资料"
      description="查看你的账号身份和组织内角色。资料编辑能力将在身份服务开放更新接口后接入。"
    />
    <section class="profile-card">
      <div class="avatar">{{ username.slice(0, 1).toUpperCase() }}</div>
      <div>
        <span>显示名称</span>
        <h2>{{ username }}</h2>
        <p>用户 ID：{{ userId }}</p>
      </div>
      <NebulaButton variant="outline" disabled>编辑资料</NebulaButton>
    </section>
    <section class="personal-section">
      <h2>角色与访问范围</h2>
      <p>角色决定你在 Settings 中可见的组织和平台治理入口。</p>
      <div class="role-list">
        <NebulaTag v-for="role in roles" :key="role">{{ role }}</NebulaTag>
        <NebulaTag v-if="roles.length === 0">普通用户</NebulaTag>
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
  background: linear-gradient(145deg, hsl(var(--primary)), #7c5cff);
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
