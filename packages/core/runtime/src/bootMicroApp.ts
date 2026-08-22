import type { App } from 'vue';

import type { BootMicroAppOptions } from './index';

import {
  __resetResolvedRuntimeModeForTests,
  installShellEmbedNavigationListener,
  postShellEmbedPageMeta,
  requireRuntimeMode,
  setResolvedRuntimeMode,
  wireShellEventBus,
} from '@nebula-studio/shell-protocol';
import type { RuntimeMode } from '@nebula-studio/shell-protocol';

import { bootSubApp } from '@nebula-studio-electron/electron-bridge/vue';

export interface MicroAppHandle {
  app: App;
  dispose(): void;
  unmount(): void;
}

let activeHandle: MicroAppHandle | null = null;

/**
 * 统一微应用启动入口（兼容 adapter）。
 *
 * Federation Remote 使用 `NebulaRemoteApplication`（application-contract），不要新增 bootMicroApp 调用方。
 *
 * 内部启动顺序：
 * 1. auth（AuthBootstrap）
 * 2. beforeMountAsync（可选，异步）
 * 3. 委托 bootSubApp（ConfigProvider + mount）
 *
 * Web `installWebPresentation` 由 Host / standalone composition root 在调用本函数之前完成。
 *
 * 返回 MicroAppHandle，调用 dispose() 可释放 auth 监听、event bus 订阅与 Vue 实例。
 */
export async function bootMicroApp(
  options: BootMicroAppOptions,
): Promise<MicroAppHandle | undefined> {
  activeHandle?.dispose();

  const mode = requireRuntimeMode(options.mode);
  setResolvedRuntimeMode(mode);
  const disposers: Array<() => void> = [];

  if (options.shellEventBus && options.shellEventBusHandlers) {
    disposers.push(
      wireShellEventBus(options.shellEventBus, options.shellEventBusHandlers),
    );
  }

  const authOk = await runAuth(options, mode, disposers);
  if (!authOk) {
    for (const dispose of disposers) {
      try {
        dispose();
      } catch {
        /* ignore */
      }
    }
    options.onAuthFailed?.();
    return undefined;
  }

  await options.beforeMountAsync?.();

  if (options.router && mode === 'platform-embed') {
    disposers.push(
      installShellEmbedNavigationListener((path) => {
        void options.router?.push(path);
      }),
    );
    disposers.push(
      options.router.afterEach((to) => {
        const title =
          typeof to.meta.title === 'string'
            ? to.meta.title
            : typeof to.name === 'string'
              ? to.name
              : undefined;
        const helpKey =
          typeof to.meta.helpKey === 'string' ? to.meta.helpKey : undefined;
        postShellEmbedPageMeta({
          appId: options.appId,
          path: to.fullPath,
          ...(title ? { title } : {}),
          ...(helpKey ? { helpKey } : {}),
        });
        requestAnimationFrame(() => {
          const focusTarget = document.querySelector<HTMLElement>(
            'main, [role="main"], h1, [tabindex="-1"]',
          );
          if (!focusTarget) return;
          if (!focusTarget.hasAttribute('tabindex'))
            focusTarget.setAttribute('tabindex', '-1');
          focusTarget.focus({ preventScroll: true });
        });
      }),
    );
  }

  const app = bootSubApp({
    App: options.rootComponent,
    router: options.router,
    beforeMount: (vueApp) => {
      if (options.shellEventBus) {
        vueApp.provide('shellEventBus', options.shellEventBus);
      }
      options.beforeMount?.(vueApp);

      if (
        options.router &&
        options.embedDefaultRoute &&
        mode === 'platform-embed'
      ) {
        const initial = options.router.resolve(window.location.pathname);
        if (initial.matched.length === 0) {
          void options.router.replace(options.embedDefaultRoute);
        }
      }
    },
  });

  const handle: MicroAppHandle = {
    app,
    unmount() {
      app.unmount();
    },
    dispose() {
      app.unmount();
      for (const dispose of disposers) {
        try {
          dispose();
        } catch {
          /* ignore */
        }
      }
      disposers.length = 0;
      if (activeHandle === handle) {
        activeHandle = null;
      }
    },
  };

  activeHandle = handle;
  return handle;
}

async function runAuth(
  options: BootMicroAppOptions,
  mode: string,
  disposers: Array<() => void>,
): Promise<boolean> {
  if (options.auth?.bootstrap) {
    return options.auth.bootstrap();
  }

  if (options.auth?.enabled) {
    try {
      const { AuthBootstrap } = await import('@nebula-studio/auth');
      const { ok, dispose } = await AuthBootstrap.register(
        mode as RuntimeMode,
        {
          appId: options.appId,
          surfaceId: options.appId,
          onAuthFailed: options.onAuthFailed,
        },
      );
      disposers.push(dispose);
      return ok;
    } catch (error) {
      console.error('[bootMicroApp] AuthBootstrap failed:', error);
      return false;
    }
  }

  return true;
}

/** @internal Test-only reset for active handle between cases. */
export function __resetActiveMicroAppHandleForTests(): void {
  if (activeHandle) {
    try {
      activeHandle.app?.unmount?.();
    } catch {
      /* ignore */
    }
    activeHandle = null;
  }
  __resetResolvedRuntimeModeForTests();
}
