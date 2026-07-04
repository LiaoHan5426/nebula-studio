<script setup lang="ts">
import type { NebulaThemeMode } from '../../types/layout';
import { useLayoutPreferences } from '../../composables/useLayoutPreferences';
import { ACCENT_PRESETS } from '../../types/layout';

defineProps<{
  theme?: NebulaThemeMode;
}>();

const emit = defineEmits<{
  'update:theme': [value: NebulaThemeMode];
}>();

const { preferences } = useLayoutPreferences();

function setThemeMode(mode: 'light' | 'dark' | 'system') {
  preferences.themeMode = mode;
  if (mode === 'system') {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    emit('update:theme', prefersDark ? 'dark' : 'light');
    return;
  }
  emit('update:theme', mode);
}

function applyAccent(id: string) {
  preferences.accentPreset = id;
  const preset = ACCENT_PRESETS.find((p) => p.id === id);
  if (preset && typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--primary', preset.primary);
  }
}
</script>

<template>
  <section class="appearance-tab">
    <h3 class="appearance-tab__title">主题</h3>
    <div class="appearance-tab__modes">
      <button
        type="button"
        class="appearance-tab__mode"
        :class="{ 'is-active': preferences.themeMode === 'light' }"
        @click="setThemeMode('light')"
      >
        浅色
      </button>
      <button
        type="button"
        class="appearance-tab__mode"
        :class="{ 'is-active': preferences.themeMode === 'dark' }"
        @click="setThemeMode('dark')"
      >
        深色
      </button>
      <button
        type="button"
        class="appearance-tab__mode"
        :class="{ 'is-active': preferences.themeMode === 'system' }"
        @click="setThemeMode('system')"
      >
        跟随系统
      </button>
    </div>

    <h3 class="appearance-tab__title">内置主题</h3>
    <div class="appearance-tab__presets">
      <button
        v-for="preset in ACCENT_PRESETS"
        :key="preset.id"
        type="button"
        class="appearance-tab__preset"
        :class="{ 'is-active': preferences.accentPreset === preset.id }"
        @click="applyAccent(preset.id)"
      >
        <span
          class="appearance-tab__swatch"
          :style="{ background: `hsl(${preset.primary})` }"
        />
        <span>{{ preset.label }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.appearance-tab__title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
}

.appearance-tab__modes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 18px;
}

.appearance-tab__mode {
  padding: 12px 8px;
  font-size: 12px;
  cursor: pointer;
  background: hsl(var(--muted) / 40%);
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
}

.appearance-tab__mode.is-active {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 1px hsl(var(--primary) / 35%);
}

.appearance-tab__presets {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.appearance-tab__preset {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  padding: 10px 6px;
  font-size: 11px;
  cursor: pointer;
  background: hsl(var(--muted) / 30%);
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
}

.appearance-tab__preset.is-active {
  border-color: hsl(var(--primary));
}

.appearance-tab__swatch {
  width: 22px;
  height: 22px;
  border-radius: 6px;
}
</style>
