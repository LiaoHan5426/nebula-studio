<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { NebulaPane, NebulaButton } from '@nebula-studio/nebula-ui';

type ThemeMode = 'light' | 'dark';

const currentTheme = ref<ThemeMode>('dark');
const saving = ref(false);
let disposeThemeListener: (() => void) | undefined;

async function loadTheme(): Promise<void> {
  currentTheme.value = await window.api.settings.getTheme();
}

async function applyTheme(theme: ThemeMode): Promise<void> {
  if (saving.value) return;
  saving.value = true;
  try {
    currentTheme.value = await window.api.settings.setTheme(theme);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  await loadTheme();
  disposeThemeListener = window.api.settings.onThemeChanged(({ theme }) => {
    currentTheme.value = theme;
  });
});

onUnmounted(() => {
  disposeThemeListener?.();
  disposeThemeListener = undefined;
});
</script>

<template>
  <NebulaPane
    class="panel"
    title="Theme"
    description="Use unified nebula theme toggle"
  >
    <div class="theme-group">
      <span class="theme-label">Dark mode</span>
      <NebulaButton
        icon
        variant="ghost"
        :disabled="saving"
        :title="currentTheme === 'dark' ? '切换到浅色主题' : '切换到深色主题'"
        @click="applyTheme(currentTheme === 'dark' ? 'light' : 'dark')"
      >
        <svg
          v-if="currentTheme === 'dark'"
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
      Current: <strong>{{ currentTheme }}</strong
      >{{ saving ? ' (saving...)' : '' }}
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
