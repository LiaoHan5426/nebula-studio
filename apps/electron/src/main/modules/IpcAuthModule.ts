import { BrowserWindow, ipcMain, net } from 'electron';
import type { MainModule, MainModuleContext } from '../bootstrap/MainModule';

/**
 * 认证 IPC 模块：管理登录会话状态和认证相关 IPC 通信。
 * 从 WindowManager 中拆分，职责单一。
 *
 * 登录主路径：
 * - login 子应用 App.vue 调用后端 `/api/auth/login` 获取 token
 * - 通过 `auth:establish-session` IPC 将 session 传递给主进程
 *
 * `auth:login` 保留为兼容路径，直接调用后端 API 验证凭据。
 */
export class IpcAuthModule implements MainModule {
  readonly name = 'IpcAuth';

  #authSession: {
    user: string;
    token?: string;
    roles?: string[];
    userId?: string;
  } | null = null;
  #windowManager: MainModuleContext['windowManager'] | null = null;
  #backendBaseUrl = 'http://localhost:8080';

  setup(context: MainModuleContext): void {
    this.#windowManager = context.windowManager;

    ipcMain.handle('shell:open-login', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      const mainWindow = this.#windowManager?.getMainWindow();
      if (!win || win !== mainWindow) return false;
      this.#windowManager?.openLoginModal();
      return true;
    });

    ipcMain.handle(
      'auth:login',
      async (event, payload: { user?: string; password?: string }) => {
        const user = payload?.user?.trim();
        if (!user) {
          return { ok: false as const, error: '请输入用户名' };
        }
        // 调用后端 API 验证凭据（与 Web 端同一登录入口）
        try {
          const result = await this.callBackendLogin(user, payload?.password);
          if (!result.ok) {
            return { ok: false as const, error: result.error };
          }
          this.#authSession = { user: result.username, token: result.token };
          const modalWin = BrowserWindow.fromWebContents(event.sender);
          const shellWin = modalWin?.getParentWindow();
          shellWin?.webContents.send('auth:session-changed', this.#authSession);
          this.#windowManager?.broadcast(
            'auth:session-changed',
            this.#authSession,
          );
          return {
            ok: true as const,
            user: result.username,
            token: result.token,
          };
        } catch (error) {
          return {
            ok: false as const,
            error: error instanceof Error ? error.message : '登录失败',
          };
        }
      },
    );

    ipcMain.handle(
      'auth:establish-session',
      (
        event,
        payload: {
          user?: string;
          token?: string;
          roles?: string[];
          userId?: string;
        },
      ): boolean => {
        const user = payload?.user?.trim();
        const token = payload?.token?.trim();
        if (!user || !token) return false;
        this.#authSession = {
          user,
          token,
          roles: payload.roles,
          userId: payload.userId,
        };
        const mainWindow = this.#windowManager?.getMainWindow();
        mainWindow?.webContents.send('auth:session-changed', this.#authSession);
        this.#windowManager?.broadcast(
          'auth:session-changed',
          this.#authSession,
        );
        const loginWin = BrowserWindow.fromWebContents(event.sender);
        if (loginWin && loginWin !== mainWindow) {
          loginWin.close();
        }
        return true;
      },
    );

    ipcMain.handle('auth:get-session', () => this.#authSession);

    ipcMain.handle('auth:logout', (event) => {
      this.#authSession = null;
      const shellWin =
        BrowserWindow.fromWebContents(event.sender) ??
        this.#windowManager?.getMainWindow();
      shellWin?.webContents.send('auth:session-changed', null);
      this.#windowManager?.broadcast('auth:session-changed', null);
      return true;
    });
  }

  /**
   * 调用后端 `/api/auth/login` 验证凭据。
   * 使用 Electron net 模块发起请求（共享 Chromium 网络栈）。
   */
  private async callBackendLogin(
    username: string,
    password?: string,
  ): Promise<
    | { ok: true; username: string; token?: string }
    | { ok: false; error: string }
  > {
    try {
      const response = await net.fetch(
        `${this.#backendBaseUrl}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password: password ?? '' }),
        },
      );
      if (!response.ok) {
        return { ok: false, error: '登录失败，请检查用户名和密码' };
      }
      const body = (await response.json()) as {
        data?: { token?: string; username?: string };
        isSuccess?: boolean;
        code?: number;
      };
      const ok =
        body.isSuccess === true ||
        body.code === 200 ||
        Boolean(body.data?.token);
      if (!ok || !body.data?.username) {
        return { ok: false, error: '登录响应无效' };
      }
      return {
        ok: true,
        username: body.data.username,
        token: body.data.token,
      };
    } catch {
      return { ok: false, error: '无法连接后端服务' };
    }
  }
}
