import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { BrowserView, BrowserWindow, ipcMain, shell } from 'electron';
import type { WebContents } from 'electron';
import { is } from '@electron-toolkit/utils';
import {
  getDefaultEnabledShellIntegrableIds,
  listShellIntegrableAppIds,
} from '@nebula-studio/app-shell/shell-integration';
import icon from '../../../../resources/icon.png?asset';
import appConfig from '../../../../app.config';
import {
  listEmbeddedWindowIds,
  resolveRendererEntry,
} from '../../windowRegistry';
import type { EmbeddedWindowId } from '../../windowRegistry';
import type { AbstractSecurityRule } from '../security/AbstractSecurityRule';

type WindowId = keyof typeof appConfig.windows;

function preloadJsPath(slug: string): string {
  return resolve(__dirname, '../preload', `${slug}.mjs`);
}

function rendererWebPreferences(preloadSlug: string) {
  return {
    preload: preloadJsPath(preloadSlug),
    sandbox: false,
    contextIsolation: true,
    nodeIntegration: false,
  } as const;
}

function resolveTitleBarOptions() {
  if (process.platform === 'win32') {
    // Windows 下优先使用系统原生标题栏，避免与壳层自定义顶栏叠加后出现布局/点击冲突。
    return {};
  }

  if (process.platform === 'darwin') {
    return {
      titleBarStyle: 'hiddenInset' as const,
    };
  }

  return {};
}

function devRendererBaseUrl(): string | undefined {
  return (
    process.env.ELECTRON_RENDERER_URL ??
    process.env.ELECTRON_RENDERER_URL_MAIN ??
    process.env.ELECTRON_RENDERER_URL_main
  );
}

function loadRendererContents(
  contents: WebContents,
  windowId: WindowId | keyof typeof appConfig.modalRenderers,
): void {
  resolveRendererEntry(windowId);
  if (is.dev) {
    const base = devRendererBaseUrl();
    if (base) {
      const u = new URL(base);
      u.searchParams.set('renderer', windowId);
      void contents.loadURL(u.toString());
      return;
    }
  }
  const fileUrl = pathToFileURL(join(__dirname, '../renderer/index.html')).href;
  void contents.loadURL(`${fileUrl}?renderer=${windowId}`);
}

export class WindowManager {
  readonly #securityRules: AbstractSecurityRule[];
  readonly #shellViewportWidthByShellContents = new WeakMap<
    WebContents,
    number
  >();
  readonly #relayoutEmbeddedViewsByShellWindow = new WeakMap<
    BrowserWindow,
    () => void
  >();
  #embeddedViewsById = new Map<EmbeddedWindowId, BrowserView>();
  #enabledEmbeddedViewOrder: EmbeddedWindowId[] = [];
  #activeEmbeddedViewId: EmbeddedWindowId | null = null;
  /** 为 false 时收起所有 BrowserView，便于壳层 HTML 展示全屏覆盖层（如应用集成界面）。 */
  #embeddedContentVisible = true;
  #mainWindow: BrowserWindow | null = null;
  #loginWindow: BrowserWindow | null = null;
  #authSession: { user: string } | null = null;

  constructor(securityRules: AbstractSecurityRule[] = []) {
    this.#securityRules = securityRules;
  }

  registerCoreIpc(): void {
    ipcMain.on('shell-viewport', (event, payload: { width: number }) => {
      if (typeof payload?.width !== 'number' || !Number.isFinite(payload.width))
        return;
      this.#shellViewportWidthByShellContents.set(
        event.sender,
        Math.floor(payload.width),
      );
      const shellWin = BrowserWindow.fromWebContents(event.sender);
      if (shellWin) this.#relayoutEmbeddedViewsByShellWindow.get(shellWin)?.();
    });

    ipcMain.handle('shell:get-state', () => ({
      activeViewId: this.#activeEmbeddedViewId,
      availableViewIds: this.getAvailableEmbeddedViewIds(),
      dormantIntegrableIds: listShellIntegrableAppIds().filter(
        (id) =>
          !this.#enabledEmbeddedViewOrder.includes(id as EmbeddedWindowId),
      ),
    }));

    ipcMain.handle('shell:clear-active-embedded-view', () => {
      this.#activeEmbeddedViewId = null;
      if (this.#mainWindow) {
        this.#relayoutEmbeddedViewsByShellWindow.get(this.#mainWindow)?.();
      }
      return true;
    });

    ipcMain.handle(
      'shell:set-active-view',
      (_event, payload: { viewId?: string }) => {
        const viewId = payload?.viewId;
        if (typeof viewId !== 'string' || !viewId) return false;
        return this.setActiveEmbeddedView(viewId as EmbeddedWindowId);
      },
    );

    ipcMain.handle(
      'shell:enable-embedded-view',
      (_event, payload: { viewId?: string }) => {
        const viewId = payload?.viewId;
        if (typeof viewId !== 'string' || !viewId) return false;
        const wid = viewId as EmbeddedWindowId;
        if (!listShellIntegrableAppIds().includes(wid)) return false;
        if (!this.#embeddedViewsById.has(wid)) return false;
        if (!this.#enabledEmbeddedViewOrder.includes(wid)) {
          this.#enabledEmbeddedViewOrder.push(wid);
        }
        return this.setActiveEmbeddedView(wid);
      },
    );

    ipcMain.handle(
      'shell:disable-embedded-view',
      (_event, payload: { viewId?: string }) => {
        const viewId = payload?.viewId;
        if (typeof viewId !== 'string' || !viewId) return false;
        const wid = viewId as EmbeddedWindowId;
        if (!listShellIntegrableAppIds().includes(wid)) return false;
        if (!this.#embeddedViewsById.has(wid)) return false;
        if (!this.#enabledEmbeddedViewOrder.includes(wid)) return true;
        this.#enabledEmbeddedViewOrder = this.#enabledEmbeddedViewOrder.filter(
          (id) => id !== wid,
        );
        if (this.#activeEmbeddedViewId === wid) {
          this.#activeEmbeddedViewId =
            this.getAvailableEmbeddedViewIds()[0] ?? null;
          if (this.#mainWindow) {
            if (this.#activeEmbeddedViewId) {
              const nextView = this.#embeddedViewsById.get(
                this.#activeEmbeddedViewId,
              );
              if (nextView) this.#mainWindow.setTopBrowserView(nextView);
            }
            this.#relayoutEmbeddedViewsByShellWindow.get(this.#mainWindow)?.();
          }
        }
        return true;
      },
    );

    ipcMain.handle(
      'shell:reorder-embedded-views',
      (_event, payload: { orderedViewIds?: string[] }) => {
        const ordered = payload?.orderedViewIds;
        if (!Array.isArray(ordered)) return false;
        const next = ordered.filter(
          (id): id is EmbeddedWindowId =>
            typeof id === 'string' &&
            this.#embeddedViewsById.has(id as EmbeddedWindowId) &&
            this.#enabledEmbeddedViewOrder.includes(id as EmbeddedWindowId),
        );
        if (next.length !== this.#enabledEmbeddedViewOrder.length) return false;
        if (new Set(next).size !== this.#enabledEmbeddedViewOrder.length)
          return false;
        this.#enabledEmbeddedViewOrder = [...next];
        this.#activeEmbeddedViewId =
          this.#activeEmbeddedViewId &&
          this.#enabledEmbeddedViewOrder.includes(this.#activeEmbeddedViewId)
            ? this.#activeEmbeddedViewId
            : (this.#enabledEmbeddedViewOrder[0] ?? null);
        if (this.#mainWindow) {
          const top = this.#activeEmbeddedViewId
            ? this.#embeddedViewsById.get(this.#activeEmbeddedViewId)
            : null;
          if (top) this.#mainWindow.setTopBrowserView(top);
          this.#relayoutEmbeddedViewsByShellWindow.get(this.#mainWindow)?.();
        }
        return true;
      },
    );

    ipcMain.handle(
      'shell:set-embedded-content-visible',
      (_event, payload: { visible?: boolean }) => {
        this.#embeddedContentVisible = payload?.visible !== false;
        if (this.#mainWindow) {
          this.#relayoutEmbeddedViewsByShellWindow.get(this.#mainWindow)?.();
        }
        return true;
      },
    );

    ipcMain.handle('shell:open-login', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win || win !== this.#mainWindow) return false;
      this.openLoginModal();
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
        return { ok: true as const, user };
      },
    );

    ipcMain.handle('auth:get-session', () => this.#authSession);

    ipcMain.handle('auth:logout', (event) => {
      this.#authSession = null;
      const shellWin =
        BrowserWindow.fromWebContents(event.sender) ?? this.#mainWindow;
      shellWin?.webContents.send('auth:session-changed', null);
      return true;
    });
  }

  createShellWindow(): BrowserWindow {
    const cfg = appConfig.windows.main;
    const win = new BrowserWindow({
      title: '',
      width: 960,
      height: 720,
      minWidth: 1100,
      minHeight: 720,
      show: false,
      autoHideMenuBar: true,
      ...resolveTitleBarOptions(),
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: rendererWebPreferences(cfg.preload),
    });
    this.#mainWindow = win;
    this.#applySecurityRules(win.webContents);
    loadRendererContents(win.webContents, 'main');

    const embeddedViews = new Map<EmbeddedWindowId, BrowserView>();
    const relayoutEmbedded = (): void => {
      this.#layoutEmbeddedBrowserViews(win, embeddedViews);
    };
    this.#relayoutEmbeddedViewsByShellWindow.set(win, relayoutEmbedded);

    for (const id of listEmbeddedWindowIds()) {
      const wcfg = resolveRendererEntry(id);
      const view = new BrowserView({
        webPreferences: {
          ...rendererWebPreferences(wcfg.preload as string),
          session: win.webContents.session,
        },
      });
      this.#applySecurityRules(view.webContents);
      loadRendererContents(view.webContents, id);
      win.addBrowserView(view);
      embeddedViews.set(id, view);
    }
    this.#embeddedViewsById = embeddedViews;
    this.#enabledEmbeddedViewOrder = this.#initialEnabledEmbeddedViewOrder();
    // 与 Web 侧「无 nebula-shell-active-view 先展示应用集成」一致，不预选中首个 BrowserView
    this.#activeEmbeddedViewId = null;

    if (is.dev) {
      win.webContents.once('did-finish-load', () => {
        win.webContents.openDevTools({ mode: 'right' });
        relayoutEmbedded();
      });
    }

    win.on('resize', relayoutEmbedded);
    win.on('ready-to-show', () => {
      relayoutEmbedded();
      win.show();
    });
    win.on('closed', () => {
      if (this.#mainWindow === win) {
        this.#mainWindow = null;
      }
      this.#embeddedViewsById = new Map();
      this.#enabledEmbeddedViewOrder = [];
      this.#activeEmbeddedViewId = null;
    });

    win.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: 'deny' };
    });

    return win;
  }

  getMainWindow(): BrowserWindow | null {
    return this.#mainWindow;
  }

  focusMainWindow(): void {
    if (!this.#mainWindow) {
      return;
    }
    if (this.#mainWindow.isMinimized()) {
      this.#mainWindow.restore();
    }
    this.#mainWindow.focus();
  }

  getAvailableEmbeddedViewIds(): EmbeddedWindowId[] {
    return [...this.#enabledEmbeddedViewOrder];
  }

  #initialEnabledEmbeddedViewOrder(): EmbeddedWindowId[] {
    const integratable = new Set<string>(listShellIntegrableAppIds());
    const defaultOn = new Set<string>(getDefaultEnabledShellIntegrableIds());
    const next: EmbeddedWindowId[] = [];
    for (const id of listEmbeddedWindowIds()) {
      if (!integratable.has(id)) {
        next.push(id);
      } else if (defaultOn.has(id)) {
        next.push(id);
      }
    }
    return next;
  }

  getActiveEmbeddedViewId(): EmbeddedWindowId | null {
    return this.#activeEmbeddedViewId;
  }

  setActiveEmbeddedView(viewId: EmbeddedWindowId): boolean {
    if (!this.#enabledEmbeddedViewOrder.includes(viewId)) return false;
    const view = this.#embeddedViewsById.get(viewId);
    if (!view) return false;
    this.#activeEmbeddedViewId = viewId;
    if (this.#mainWindow) {
      this.#mainWindow.setTopBrowserView(view);
      this.#relayoutEmbeddedViewsByShellWindow.get(this.#mainWindow)?.();
    }
    return true;
  }

  broadcast(channel: string, payload: unknown): void {
    this.#mainWindow?.webContents.send(channel, payload);
    for (const view of this.#embeddedViewsById.values()) {
      view.webContents.send(channel, payload);
    }
  }

  openLoginModal(): void {
    if (this.#loginWindow && !this.#loginWindow.isDestroyed()) {
      this.#loginWindow.focus();
      return;
    }
    const parent = this.#mainWindow;
    if (!parent) return;

    const { preload } = resolveRendererEntry('login');
    const win = new BrowserWindow({
      parent,
      modal: true,
      width: 420,
      height: 560,
      show: false,
      autoHideMenuBar: true,
      resizable: false,
      maximizable: false,
      minimizable: false,
      fullscreenable: false,
      ...resolveTitleBarOptions(),
      webPreferences: rendererWebPreferences(preload),
    });
    this.#applySecurityRules(win.webContents);
    loadRendererContents(win.webContents, 'login');
    win.once('ready-to-show', () => {
      win.show();
    });
    win.on('closed', () => {
      this.#loginWindow = null;
    });
    this.#loginWindow = win;
  }

  #layoutEmbeddedBrowserViews(
    win: BrowserWindow,
    views: Map<EmbeddedWindowId, BrowserView>,
  ): void {
    const top = appConfig.shell.topInsetPx;
    const { width, height } = win.getContentBounds();
    const shellW = this.#shellViewportWidthByShellContents.get(win.webContents);
    const w = Math.max(0, shellW ?? width);
    const h = Math.max(0, height - top);
    for (const [id, view] of views) {
      const isActive = this.#activeEmbeddedViewId === id;
      const show = this.#embeddedContentVisible && isActive;
      view.setBounds({
        x: 0,
        y: top,
        width: show ? w : 0,
        height: show ? h : 0,
      });
    }
  }

  #applySecurityRules(contents: WebContents): void {
    for (const rule of this.#securityRules) {
      rule.applyRule(contents);
    }
  }
}
