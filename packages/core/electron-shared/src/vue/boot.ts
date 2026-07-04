import { createApp, h } from 'vue';
import type { Component } from 'vue';
import type { Router } from 'vue-router';
import { ConfigProvider } from './ConfigProvider.ts';

/**
 * Options for booting a sub-application.
 */
export interface BootSubAppOptions {
  /** Root Vue component for the sub-app. */
  App: Component;
  /** Vue Router instance (optional — not all sub-apps use routing). */
  router?: Router;
  /** Callback invoked before mounting — use for plugin installation, etc. */
  beforeMount?: (app: ReturnType<typeof createApp>) => void;
}

/**
 * Unified sub-app boot helper.
 *
 * Creates a Vue app wrapped in `ConfigProvider`, optionally installs a router,
 * calls `beforeMount` for any extra setup, and mounts to `#app`.
 *
 * Usage:
 * ```ts
 * import { bootSubApp } from '@nebula-studio-electron/electron-bridge/vue';
 * import App from './App.vue';
 * import router from './router';
 *
 * bootSubApp({ App, router });
 * ```
 */
export function bootSubApp(options: BootSubAppOptions): void {
  const { App, router, beforeMount } = options;

  const app = createApp({
    render() {
      return h(
        ConfigProvider,
        { manageDom: true },
        {
          default: () => h(App),
        },
      );
    },
  });

  if (router) {
    app.use(router);
  }

  if (beforeMount) {
    beforeMount(app);
  }

  app.mount('#app');
}
