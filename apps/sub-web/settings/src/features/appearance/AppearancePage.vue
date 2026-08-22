<script setup lang="ts">
import type { HostCapabilities } from '@nebula-studio/application-contract';

import { inject, ref } from 'vue';

import { HOST_CAPABILITIES_KEY } from '@nebula-studio/application-contract';
import { NebulaButton, NebulaPane } from '@nebula-studio/nebula-ui';

const capabilities = inject<HostCapabilities | undefined>(
  HOST_CAPABILITIES_KEY,
  undefined,
);

function readScheme(): 'dark' | 'light' {
  const fromHost = capabilities?.theme?.scheme;
  if (fromHost === 'dark' || fromHost === 'light') {
    return fromHost;
  }
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

const theme = ref<'dark' | 'light'>(readScheme());
const saving = ref(false);

async function applyTheme(next: 'dark' | 'light'): Promise<void> {
  if (saving.value) return;
  saving.value = true;
  try {
    if (capabilities?.theme?.setScheme) {
      await capabilities.theme.setScheme(next);
    } else {
      document.documentElement.classList.toggle('dark', next === 'dark');
      document.documentElement.dataset.nebulaTheme = next;
    }
    theme.value = next;
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <NebulaPane
    class="panel"
    title="外观与主题"
    description="统一设置 Nebula Studio 的界面主题"
  >
    <div class="theme-group">
      <span class="theme-label">深色模式</span>
      <NebulaButton
        icon
        variant="ghost"
        :disabled="saving"
        :title="theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'"
        @click="applyTheme(theme === 'dark' ? 'light' : 'dark')"
      >
        <svg
          v-if="theme === 'dark'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          width="18"
          height="18"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          width="18"
          height="18"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </NebulaButton>
    </div>
    <p class="hint">
      当前：<strong>{{ theme === 'dark' ? '深色' : '浅色' }}</strong>
      {{ saving ? '（保存中…）' : '' }}
    </p>
  </NebulaPane>
</template>

<style lang="scss" scoped>
.panel {
  max-width: 520px;
}

.theme-group {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
}

.theme-label {
  font-size: 0.88rem;
  color: hsl(var(--foreground));
}

.hint {
  margin-top: 10px;
  color: hsl(var(--muted-foreground));
}
</style>
