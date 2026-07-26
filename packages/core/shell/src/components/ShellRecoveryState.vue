<script setup lang="ts">
import { computed } from 'vue';
import { NebulaButton, NebulaIcon } from '@nebula-studio/nebula-ui';

export type ShellRecoveryKind =
  | 'offline'
  | 'load-error'
  | 'session-expired'
  | 'permission-changed';

const props = defineProps<{
  kind: ShellRecoveryKind;
  appLabel?: string;
}>();

const emit = defineEmits<{
  retry: [];
  login: [];
  back: [];
}>();

const content = computed(() => {
  const label = props.appLabel ? `“${props.appLabel}”` : '当前页面';
  switch (props.kind) {
    case 'offline':
      return {
        icon: 'cloud-off',
        title: '当前处于离线状态',
        description: `网络恢复后可重新加载${label}，已打开的工作台仍可继续浏览。`,
        action: '重新检测',
      };
    case 'session-expired':
      return {
        icon: 'lock',
        title: '会话已过期',
        description: `重新登录后会返回${label}，无需重新查找入口。`,
        action: '重新登录',
      };
    case 'permission-changed':
      return {
        icon: 'shield-alert',
        title: '访问权限已发生变化',
        description: `你目前无法继续访问${label}。可返回工作台选择其他任务。`,
        action: '返回工作台',
      };
    default:
      return {
        icon: 'triangle-alert',
        title: '应用加载失败',
        description: `${label}暂时无法打开，请重试或返回工作台。`,
        action: '重新加载',
      };
  }
});

function primaryAction(): void {
  if (props.kind === 'session-expired') emit('login');
  else if (props.kind === 'permission-changed') emit('back');
  else emit('retry');
}
</script>

<template>
  <section class="shell-recovery" role="alert">
    <span class="shell-recovery__icon">
      <NebulaIcon :icon="content.icon" size="28" />
    </span>
    <h2>{{ content.title }}</h2>
    <p>{{ content.description }}</p>
    <div>
      <NebulaButton variant="primary" @click="primaryAction">
        {{ content.action }}
      </NebulaButton>
      <NebulaButton
        v-if="kind !== 'permission-changed'"
        variant="ghost"
        @click="emit('back')"
      >
        返回工作台
      </NebulaButton>
    </div>
  </section>
</template>

<style scoped>
.shell-recovery {
  display: grid;
  gap: var(--space-3);
  place-items: center;
  width: min(30rem, calc(100% - var(--space-8)));
  padding: var(--space-8);
  margin: auto;
  color: hsl(var(--foreground));
  text-align: center;
  background: hsl(var(--card) / 88%);
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
}

.shell-recovery__icon {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  color: hsl(var(--warning));
  background: hsl(var(--warning) / 12%);
  border-radius: 50%;
}

.shell-recovery h2,
.shell-recovery p {
  margin: 0;
}

.shell-recovery p {
  color: hsl(var(--muted-foreground));
}

.shell-recovery div {
  display: flex;
  gap: var(--space-2);
}
</style>
