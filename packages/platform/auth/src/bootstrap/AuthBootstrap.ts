/**
 * AuthBootstrap — 认证编排入口。
 *
 * 根据 RuntimeMode 自动选择对应策略，提供统一的 `register()` API。
 * Application bootstrap 通过 `auth: { enabled: true }` 触发。
 */
import type { AuthBootstrapOptions, AuthStrategy } from './types';

import { ElectronStrategy } from './strategies/electron';
import { EmbedStrategy } from './strategies/embed';
import { StandaloneStrategy } from './strategies/standalone';

/**
 * 运行时模式由 `@nebula-studio/shell-protocol` 定义。
 * 此处本地声明以避免循环依赖。
 */
type RuntimeMode = 'electron' | 'platform-embed' | 'standalone';

/**
 * 根据运行时模式解析对应的认证策略。
 */
function resolveStrategy(mode: RuntimeMode): AuthStrategy {
  switch (mode) {
    case 'electron':
      return new ElectronStrategy();
    case 'platform-embed':
      return new EmbedStrategy();
    case 'standalone':
      return new StandaloneStrategy();
    default: {
      // 穷尽检查
      const _exhaustive: never = mode;
      throw new Error(`Unknown runtime mode: ${String(_exhaustive)}`);
    }
  }
}

export class AuthBootstrap {
  /**
   * 注册认证策略并执行 bootstrap。
   *
   * @param mode   运行时模式
   * @param options 可选配置
   * @returns dispose 函数，用于清理事件监听等资源
   */
  static async register(
    mode: RuntimeMode,
    options?: AuthBootstrapOptions,
  ): Promise<{ dispose: () => void; ok: boolean }> {
    const strategy = resolveStrategy(mode);
    const ok = await strategy.bootstrap(options);
    if (!ok) {
      options?.onAuthFailed?.();
    }
    return {
      ok,
      dispose: () => strategy.dispose(),
    };
  }
}
