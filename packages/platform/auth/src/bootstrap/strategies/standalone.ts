import type { AuthBootstrapOptions, AuthStrategy } from '../types';

/**
 * StandaloneStrategy — 独立部署模式认证策略。
 *
 * 认证逻辑：
 * - 检查 sessionStorage 中是否有有效 token（通过 auth-provider）
 * - 无 token 时由 router beforeEach guard 拦截到登录页
 * - 登录页使用 `@nebula-studio/login-ui` 组件
 * - Host Web 与 Electron 登录入口由 `apps/web/src/auth/bootHostLogin.ts` 挂载
 *
 * 迁移来源：
 * - integration/src/router/index.ts 的 beforeEach guard
 * - integration/src/features/auth/LoginPage.vue
 */
import { hasValidAuthToken } from '@nebula-studio/auth-provider/session';

export class StandaloneStrategy implements AuthStrategy {
  private _loginRoutePath = '/login';

  async bootstrap(options?: AuthBootstrapOptions): Promise<boolean> {
    this._loginRoutePath = options?.loginRoutePath ?? '/login';

    // standalone 模式下，bootstrap 阶段只做 session 有效性检查。
    // 实际的登录跳转由 router beforeEach guard 处理（见 boot.ts 集成）。
    if (hasValidAuthToken()) {
      return true;
    }

    // 无有效 token — 返回 false 让 application bootstrap 走 onAuthFailed，
    // 或者由 router guard 在后续导航中拦截。
    // 这里返回 true 允许 mount，因为 router guard 会处理跳转。
    return true;
  }

  /** 供 router beforeEach 使用的守卫逻辑 */
  createRouterGuard(): (to: {
    meta?: Record<string, unknown>;
    path: string;
  }) => {
    authenticated: boolean;
    redirectTo?: string;
  } {
    return (to) => {
      const isPublic =
        to.meta?.public === true || to.path === this._loginRoutePath;
      const hasToken = hasValidAuthToken();

      if (!hasToken && !isPublic) {
        return {
          authenticated: false,
          redirectTo: `${this._loginRoutePath}?redirect=${encodeURIComponent(to.path)}`,
        };
      }
      return { authenticated: true };
    };
  }

  dispose(): void {
    // standalone 模式无需清理（router guard 随 app 生命周期结束）
  }
}
