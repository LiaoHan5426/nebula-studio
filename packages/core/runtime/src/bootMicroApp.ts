import {
  installWebPresentation,
  wireShellEventBus,
} from '@nebula-studio/app-shell';
import { bootSubApp } from '@nebula-studio-electron/electron-bridge/vue';
import type { App } from 'vue';
import { detectRuntimeMode } from './detectMode';
import type { BootMicroAppOptions } from './index';

export interface MicroAppHandle {
  app: App;
  unmount(): void;
  dispose(): void;
}

let activeHandle: MicroAppHandle | null = null;

/**
 * 统一微应用启动入口。
 *
 * 内部启动顺序：
 * 1. bridge 注入（Web 模式 → installWebPresentation；Electron → 跳过）
 * 2. auth（AuthBootstrap）
 * 3. beforeMountAsync（可选，异步）
 * 4. 委托 bootSubApp（ConfigProvider + mount）
 *
 * 返回 MicroAppHandle，调用 dispose() 可释放 auth 监听、event bus 订阅与 Vue 实例。
 */
export async function bootMicroApp(
  options: BootMicroAppOptions,
): Promise<MicroAppHandle | undefined> {
  activeHandle?.dispose();

  const mode = options.mode ?? detectRuntimeMode();
  const disposers: Array<() => void> = [];

  if (mode !== 'electron' && options.webPresentation) {
    installWebPresentation({
      scope: options.webPresentation.scope,
      registerShellHostIpc: options.webPresentation.registerShellHostIpc,
      processVersions: options.webPresentation.processVersions,
    });
  }

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
        mode as import('./detectMode').RuntimeMode,
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
}
