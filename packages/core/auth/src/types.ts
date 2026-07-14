/**
 * @nebula-studio/auth — 认证编排包类型定义。
 *
 * 将原本散落在 integration / app-shell / electron 各处的认证逻辑
 * 统一为按 RuntimeMode 分发的策略模式。
 */
import type { AuthProfile } from '@nebula-studio/contracts/auth';

/**
 * AuthBootstrap 的可选配置。
 *
 * 各策略按需读取；不需要的字段可留空。
 */
export interface AuthBootstrapOptions {
  /** 当前子应用 ID（如 integration、settings） */
  appId?: string;

  /** embed surface ID；默认与 appId 相同 */
  surfaceId?: string;

  /** 登录成功后的回调（如同步 tenant / profile） */
  onAuthenticated?: (profile: AuthProfile) => void | Promise<void>;

  /** 认证失败回调（如跳转登录页） */
  onAuthFailed?: () => void;

  /**
   * standalone 模式下的登录页路由路径。
   * 默认 `/login`。
   */
  loginRoutePath?: string;

  /**
   * embed 模式下是否允许向父 Shell 请求打开登录弹窗。
   * 默认 `true`。
   */
  allowShellLogin?: boolean;
}

/**
 * 认证策略接口。
 *
 * 每种 RuntimeMode 对应一个策略实现：
 * - `standalone` → StandaloneStrategy（router guard + login 子应用）
 * - `platform-embed` → EmbedStrategy（readParentShellAuthSession）
 * - `electron` → ElectronStrategy（IPC auth:get-session / establish-session）
 */
export interface AuthStrategy {
  /**
   * 启动认证流程。
   *
   * 在 `bootMicroApp` 的 mount 之前调用。
   * 返回 `true` 表示已认证可继续挂载；`false` 表示认证失败。
   */
  bootstrap(options?: AuthBootstrapOptions): Promise<boolean>;

  /**
   * 清理资源（移除事件监听等）。
   */
  dispose(): void;
}
