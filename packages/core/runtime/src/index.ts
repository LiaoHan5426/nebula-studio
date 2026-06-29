import type { InstallWebPresentationOptions } from '@nebula-studio/app-shell';
import type { Component } from 'vue';
import type { Router } from 'vue-router';

export type { RuntimeMode } from './detectMode';
export { detectRuntimeMode } from './detectMode';

export interface BootMicroAppOptions {
  /** 子应用标识，用于日志与 bridge scope */
  appId: string;

  /** 运行时模式；不传则自动检测 */
  mode?: import('./detectMode').RuntimeMode;

  /** 根 Vue 组件 */
  rootComponent: Component;

  /** Vue Router 实例（可选） */
  router?: Router;

  /**
   * Web 模式下的 installWebPresentation 选项。
   * electron 模式不需要（preload 已注入）。
   */
  webPresentation?: {
    scope: string;
    registerShellHostIpc?: boolean;
    processVersions?: InstallWebPresentationOptions['processVersions'];
  };

  /** mount 前同步回调，用于插件安装等 */
  beforeMount?: (app: ReturnType<typeof import('vue').createApp>) => void;

  /**
   * mount 前异步回调（如 bootstrapAuthFromShell）。
   * 在 authGuard 之后、bootSubApp 之前执行。
   */
  beforeMountAsync?: () => Promise<void>;

  /**
   * 认证守卫：返回 true 表示已认证可继续挂载。
   * 不传则跳过认证检查。
   */
  authGuard?: () => Promise<boolean>;

  /** 认证失败回调 */
  onAuthFailed?: () => void;

  /**
   * platform-embed 模式：router 无匹配时 replace 到默认路由。
   * 如 integration 的 `/subscriptions`。
   */
  embedDefaultRoute?: string;
}

export { bootMicroApp } from './bootMicroApp';
