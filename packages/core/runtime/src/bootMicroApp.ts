import { installWebPresentation } from '@nebula-studio/app-shell';
import { bootSubApp } from '@nebula-studio-electron/electron-bridge/vue';
import { detectRuntimeMode } from './detectMode';
import type { BootMicroAppOptions } from './index';

/**
 * 统一微应用启动入口。
 *
 * 内部启动顺序：
 * 1. bridge 注入（Web 模式 → installWebPresentation；Electron → 跳过）
 * 2. authGuard（可选）
 * 3. beforeMountAsync（可选，异步）
 * 4. 委托 bootSubApp（ConfigProvider + mount）
 */
export async function bootMicroApp(
  options: BootMicroAppOptions,
): Promise<void> {
  const mode = options.mode ?? detectRuntimeMode();

  // 1. Bridge 注入：Web 模式需要 installWebPresentation
  if (mode !== 'electron' && options.webPresentation) {
    installWebPresentation({
      scope: options.webPresentation.scope,
      registerShellHostIpc: options.webPresentation.registerShellHostIpc,
      processVersions: options.webPresentation.processVersions,
    });
  }

  // 2. Auth guard（可选）
  if (options.authGuard) {
    const ok = await options.authGuard();
    if (!ok) {
      options.onAuthFailed?.();
      return;
    }
  }

  // 3. 异步 before-mount（如 bootstrapAuthFromShell）
  await options.beforeMountAsync?.();

  // 4. 委托 bootSubApp（ConfigProvider + mount）
  bootSubApp({
    App: options.rootComponent,
    router: options.router,
    beforeMount: (app) => {
      options.beforeMount?.(app);

      // platform-embed：router 无匹配时 replace 到默认路由
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
}
