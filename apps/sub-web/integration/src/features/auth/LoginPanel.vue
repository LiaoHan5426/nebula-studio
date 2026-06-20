<script setup lang="ts">
import { ref } from 'vue';
import { NebulaButton, NebulaPane } from '@nebula-studio/nebula-ui';

import { useAuth } from '@/shared/composables/useAuth';

const emit = defineEmits<{
  close: [];
  success: [];
}>();

withDefaults(
  defineProps<{
    mode?: 'modal' | 'page';
  }>(),
  { mode: 'modal' },
);

const { login, loading, error } = useAuth();

const username = ref('admin');
const password = ref('admin123');

async function handleSubmit() {
  const ok = await login(username.value, password.value);
  if (ok) {
    emit('success');
  }
}
</script>

<template>
  <NebulaPane title="登录" class="login-panel">
    <form class="login-panel__form" @submit.prevent="handleSubmit">
      <label class="login-panel__field">
        <span>用户名</span>
        <input v-model="username" class="login-panel__input" required />
      </label>
      <label class="login-panel__field">
        <span>密码</span>
        <input
          v-model="password"
          type="password"
          class="login-panel__input"
          placeholder="Demo 环境可留空"
        />
      </label>
      <p v-if="error" class="login-panel__error">{{ error }}</p>
      <div class="login-panel__actions">
        <NebulaButton
          v-if="mode === 'modal'"
          variant="secondary"
          type="button"
          @click="emit('close')"
        >
          取消
        </NebulaButton>
        <NebulaButton type="submit" :disabled="loading">
          {{ loading ? '登录中…' : '登录' }}
        </NebulaButton>
      </div>
    </form>
  </NebulaPane>
</template>

<style scoped>
.login-panel {
  width: min(400px, 92vw);
}

.login-panel__form {
  display: grid;
  gap: 16px;
}

.login-panel__field {
  display: grid;
  gap: 6px;
  font-size: 13px;
}

.login-panel__input {
  padding: 8px 12px;
  font-size: 14px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.login-panel__input:focus {
  outline: none;
  border-color: hsl(var(--primary));
}

.login-panel__error {
  font-size: 13px;
  color: hsl(var(--destructive));
}

.login-panel__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
