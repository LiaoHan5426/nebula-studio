import type { LayoutPreferences } from '../types/layout';

import { reactive, watch } from 'vue';

import {
  getLayoutHostMode,
  isWebShellHost,
  LAYOUT_PREFERENCES_STORAGE_KEY,
} from '@nebula-studio/app-shell';

import { ACCENT_PRESETS, DEFAULT_LAYOUT_PREFERENCES } from '../types/layout';

function resolveLayoutPreferencesStorageKey(): string {
  if (typeof window === 'undefined') return LAYOUT_PREFERENCES_STORAGE_KEY;
  if (isWebShellHost()) return LAYOUT_PREFERENCES_STORAGE_KEY;
  // Compatibility facade: prefers boot-stamped runtime mode, then iframe heuristic.
  if (getLayoutHostMode() === 'shell-hosted') {
    return `${LAYOUT_PREFERENCES_STORAGE_KEY}:embed`;
  }
  return `${LAYOUT_PREFERENCES_STORAGE_KEY}:standalone`;
}

function readStored(): LayoutPreferences {
  if (typeof localStorage === 'undefined')
    return { ...DEFAULT_LAYOUT_PREFERENCES };
  try {
    const raw = localStorage.getItem(resolveLayoutPreferencesStorageKey());
    if (!raw) return { ...DEFAULT_LAYOUT_PREFERENCES };
    const parsed = {
      ...DEFAULT_LAYOUT_PREFERENCES,
      ...JSON.parse(raw),
    } as LayoutPreferences;
    if ((parsed.version ?? 1) < 2) {
      parsed.pinned = false;
      parsed.version = 2;
    }
    if ((parsed.version ?? 1) < 3) {
      if (!parsed.pinned) parsed.collapsed = true;
      parsed.version = 3;
    }
    return parsed;
  } catch {
    return { ...DEFAULT_LAYOUT_PREFERENCES };
  }
}

const state = reactive<LayoutPreferences>(readStored());

if (typeof document !== 'undefined') {
  const preset = ACCENT_PRESETS.find((p) => p.id === state.accentPreset);
  if (preset) {
    document.documentElement.style.setProperty('--primary', preset.primary);
  }
}

let hydrated = false;

export function useLayoutPreferences() {
  if (!hydrated) {
    hydrated = true;
    watch(
      state,
      () => {
        try {
          localStorage.setItem(
            resolveLayoutPreferencesStorageKey(),
            JSON.stringify({ ...state }),
          );
        } catch {
          /* ignore quota */
        }
      },
      { deep: true },
    );
  }

  const reset = () => {
    Object.assign(state, DEFAULT_LAYOUT_PREFERENCES);
  };

  return { preferences: state, reset };
}
