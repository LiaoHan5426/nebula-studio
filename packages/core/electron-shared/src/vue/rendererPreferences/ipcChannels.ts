/**
 * Renderer-facing IPC channel names for user preferences.
 * Keep theme / locale (and future keys) centralized so Web stubs and composables stay aligned.
 */
export const IPC_CHANNELS = {
  theme: {
    get: 'settings:theme:get',
    set: 'settings:theme:set',
    changed: 'settings:theme:changed',
  },
  locale: {
    get: 'settings:locale:get',
    set: 'settings:locale:set',
    changed: 'settings:locale:changed',
  },
} as const;
