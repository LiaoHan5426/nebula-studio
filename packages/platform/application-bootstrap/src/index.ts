import type { Component } from 'vue';
import type { Router } from 'vue-router';

import type { WireShellEventBusOptions } from '@nebula-studio/shell-protocol';

export type { ApplicationHandle } from './startApplication';
export { startApplication } from './startApplication';

export interface StartApplicationOptions {
  /** 子应用标识，用于日志与 bridge scope */
  appId: string;

  /**
   * 统一认证配置。
   * - `enabled: true` 时由 AuthBootstrap 按 mode 自动注册策略
   * - 也可传自定义 bootstrap 函数
   *
   * 与 `auth.bootstrap` 互斥；同时存在时 `auth.bootstrap` 优先。
   */
  auth?: {
    /** 自定义认证 bootstrap（替代自动策略） */
    bootstrap?: () => Promise<boolean>;
    /** 为 true 时由 AuthBootstrap 按 mode 自动注册 */
    enabled?: boolean;
  };

  /** mount 前同步回调，用于插件安装等 */
  beforeMount?: (app: ReturnType<typeof import('vue').createApp>) => void;

  /**
   * mount 前异步回调（如 bootstrapAuthFromShell）。
   * 在 auth 之后、bootSubApp 之前执行。
   */
  beforeMountAsync?: () => Promise<void>;

  /**
   * platform-embed 模式：router 无匹配时 replace 到默认路由。
   * 如 integration 的 `/subscriptions`。
   */
  embedDefaultRoute?: string;

  /** 运行时模式；Host / standalone 入口必须传入 */
  mode: import('@nebula-studio/shell-protocol').RuntimeMode;

  /** 认证失败回调 */
  onAuthFailed?: () => void;

  /** 根 Vue 组件 */
  rootComponent: Component;

  /** Vue Router 实例（可选） */
  router?: Router;

  /** Shell 事件总线，用于跨子应用 tenant/auth 同步 */
  shellEventBus?: import('@nebula-studio/shell-protocol').ShellEventBus;

  /** shellEventBus 标准事件处理器；由 application lifecycle 注册并在 dispose 时释放 */
  shellEventBusHandlers?: WireShellEventBusOptions;
}
