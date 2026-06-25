import { BrowserWindow, ipcMain } from 'electron';
import type { MainModule, MainModuleContext } from '../bootstrap/MainModule';

/**
 * 认证 IPC 模块：管理登录会话状态和认证相关 IPC 通信。
 * 从 WindowManager 中拆分，职责单一。
 */
export class IpcAuthModule implements MainModule {
  readonly name = 'IpcAuth';

  #authSession: { user: string; token?: string } | null = null;
  #windowManager: MainModuleContext['windowManager'] | null = null;

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
      (event, payload: { user?: string; password?: string }) => {
        const user = payload?.user?.trim();
        if (!user) {
          return { ok: false as const, error: '请输入用户名' };
        }
        if (payload?.password !== 'demo') {
          return {
            ok: false as const,
            error: '演示环境请使用密码：demo',
          };
        }
        this.#authSession = { user };
        const modalWin = BrowserWindow.fromWebContents(event.sender);
        const shellWin = modalWin?.getParentWindow();
        shellWin?.webContents.send('auth:session-changed', this.#authSession);
        this.#windowManager?.broadcast(
          'auth:session-changed',
          this.#authSession,
        );
        return { ok: true as const, user };
      },
    );

    ipcMain.handle(
      'auth:establish-session',
      (event, payload: { user?: string; token?: string }): boolean => {
        const user = payload?.user?.trim();
        const token = payload?.token?.trim();
        if (!user || !token) return false;
        this.#authSession = { user, token };
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
}
