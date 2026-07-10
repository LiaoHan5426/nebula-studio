import { installWebPresentation } from '@nebula-studio/app-shell';
import { bootSubApp } from '@nebula-studio-electron/electron-bridge/vue';
import { detectRuntimeMode } from './detectMode';
import type { BootMicroAppOptions } from './index';

/**
 * 统一微应用启动入口。
 *
 * 内部启动顺序：
 * 1. bridge 注入（Web 模式 → installWebPresentation；Electron → 跳过）
 * 2. auth（AuthBootstrap）
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

  // 2. Auth：优先使用 auth 配置（AuthBootstrap）
  const authOk = await runAuth(options, mode);
  if (!authOk) {
    options.onAuthFailed?.();
    return;
  }

  // 3. 异步 before-mount（如 bootstrapAuthFromShell）
  await options.beforeMountAsync?.();

  // 4. 委托 bootSubApp（ConfigProvider + mount）
  bootSubApp({
    App: options.rootComponent,
    router: options.router,
    beforeMount: (app) => {
      if (options.shellEventBus) {
        app.provide('shellEventBus', options.shellEventBus);
      }
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

/**
 * 执行认证流程。
 *
 * 优先级：
 * 1. `auth.bootstrap` — 自定义 bootstrap 函数
 * 2. `auth.enabled` — 委托 AuthBootstrap.register()
 * 3. 无认证配置 → 直接返回 true
 */
async function runAuth(
  options: BootMicroAppOptions,
  mode: string,
): Promise<boolean> {
  // 1. 自定义 bootstrap
  if (options.auth?.bootstrap) {
    return options.auth.bootstrap();
  }

  // 2. AuthBootstrap 自动策略
  if (options.auth?.enabled) {
    try {
      // 动态导入避免循环依赖：runtime → auth → runtime
      const { AuthBootstrap } = await import('@nebula-studio/auth');
      await AuthBootstrap.register(mode as import('./detectMode').RuntimeMode);
      return true;
    } catch (error) {
      console.error('[bootMicroApp] AuthBootstrap failed:', error);
      return false;
    }
  }

  // 3. 无认证配置
  return true;
}
