<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { NebulaPane, NebulaThemeToggle } from '@nebula-studio/nebula-ui';

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
  <main class="settings">
    <header class="settings-header">
      <h1>Settings</h1>
      <p>Manage shell appearance and sync with ConfigManager.</p>
    </header>

    <NebulaPane
      class="panel"
      title="Theme"
      description="Use unified nebula theme toggle"
    >
      <div class="theme-group">
        <span class="theme-label">Dark mode</span>
        <NebulaThemeToggle
          :theme="currentTheme"
          :disabled="saving"
          tooltip="Toggle app theme"
          @update:theme="applyTheme"
        />
      </div>
      <p class="hint">
        Current: <strong>{{ currentTheme }}</strong
        >{{ saving ? ' (saving...)' : '' }}
      </p>
    </NebulaPane>
  </main>
</template>

<style scoped>
.settings {
  min-height: 100vh;
  padding: 24px;
  color: hsl(var(--foreground));
  background: linear-gradient(
    160deg,
    hsl(var(--background-deep)) 0%,
    hsl(var(--background)) 100%
  );
}

.settings-header h1 {
  margin: 0;
  font-size: 28px;
}

.settings-header p {
  margin-top: 6px;
  color: hsl(var(--muted-foreground));
}

.panel {
  margin-top: 18px;
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
