import type {
  InstallWebPresentationOptions,
  WireShellEventBusOptions,
} from '@nebula-studio/app-shell';
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
   * 在 auth 之后、bootSubApp 之前执行。
   */
  beforeMountAsync?: () => Promise<void>;

  /** 认证失败回调 */
  onAuthFailed?: () => void;

  /**
   * 统一认证配置。
   * - `enabled: true` 时由 AuthBootstrap 按 mode 自动注册策略
   * - 也可传自定义 bootstrap 函数
   *
   * 与 `auth.bootstrap` 互斥；同时存在时 `auth.bootstrap` 优先。
   */
  auth?: {
    /** 为 true 时由 AuthBootstrap 按 mode 自动注册 */
    enabled?: boolean;
    /** 自定义认证 bootstrap（替代自动策略） */
    bootstrap?: () => Promise<boolean>;
  };

  /**
   * platform-embed 模式：router 无匹配时 replace 到默认路由。
   * 如 integration 的 `/subscriptions`。
   */
  embedDefaultRoute?: string;

  /** Shell 事件总线，用于跨子应用 tenant/auth 同步 */
  shellEventBus?: import('@nebula-studio/app-shell').ShellEventBus;

  /** shellEventBus 标准事件处理器；由 bootMicroApp 注册并在 dispose 时释放 */
  shellEventBusHandlers?: WireShellEventBusOptions;
}

export type { MicroAppHandle } from './bootMicroApp';
export { bootMicroApp } from './bootMicroApp';
