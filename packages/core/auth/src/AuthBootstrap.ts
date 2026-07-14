/**
 * AuthBootstrap — 认证编排入口。
 *
 * 根据 RuntimeMode 自动选择对应策略，提供统一的 `register()` API。
 * `bootMicroApp` 通过 `auth: { enabled: true }` 触发。
 */
import type { AuthBootstrapOptions, AuthStrategy } from './types';
import { StandaloneStrategy } from './strategies/standalone';
import { EmbedStrategy } from './strategies/embed';
import { ElectronStrategy } from './strategies/electron';

/**
 * 运行时模式（与 `@nebula-studio/runtime` 的 `RuntimeMode` 保持一致）。
 * 此处本地声明以避免循环依赖。
 */
type RuntimeMode = 'standalone' | 'platform-embed' | 'electron';

/**
 * 根据运行时模式解析对应的认证策略。
 */
function resolveStrategy(mode: RuntimeMode): AuthStrategy {
  switch (mode) {
    case 'standalone':
      return new StandaloneStrategy();
    case 'platform-embed':
      return new EmbedStrategy();
    case 'electron':
      return new ElectronStrategy();
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
  ): Promise<{ ok: boolean; dispose: () => void }> {
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
