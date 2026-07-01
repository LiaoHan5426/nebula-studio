import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { BrowserView, BrowserWindow, ipcMain, shell } from 'electron';
import type { WebContents } from 'electron';
import { is } from '@electron-toolkit/utils';
import {
  getDefaultEnabledShellIntegrableIds,
  listShellIntegrableAppIds,
} from '@nebula-studio/app-shell/shell-integration';
import type { EmbeddedShellWindowId } from '@nebula-studio/app-shell';
import icon from '../../../../resources/icon.png?asset';
import appConfig from '../../../../app.config';
import {
  listEmbeddedWindowIds,
  resolveRendererEntry,
} from '../../windowRegistry';
import type { EmbeddedWindowId } from '../../windowRegistry';
import type { AbstractSecurityRule } from '../security/AbstractSecurityRule';

type WindowId = keyof typeof appConfig.windows;

/** 与壳层 `.shell-tags-view` 高度一致，用于 viewport 未上报前的安全默认区域 */
const SHELL_TAGS_HEIGHT_PX = 40;

function usesBrowserViewEmbed(): boolean {
  return (appConfig.electronEmbeddedPresentation as string) === 'browser-view';
}

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
  readonly #shellViewportBoundsByShellContents = new WeakMap<
    WebContents,
    { x: number; y: number; width: number; height: number }
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

  constructor(securityRules: AbstractSecurityRule[] = []) {
    this.#securityRules = securityRules;
  }

  registerCoreIpc(): void {
    ipcMain.on(
      'shell-viewport',
      (
        event,
        payload: {
          x?: number;
          y?: number;
          width?: number;
          height?: number;
        },
      ) => {
        if (!usesBrowserViewEmbed()) return;
        if (
          typeof payload?.width !== 'number' ||
          !Number.isFinite(payload.width)
        )
          return;
        const x =
          typeof payload.x === 'number' && Number.isFinite(payload.x)
            ? payload.x
            : 0;
        const y =
          typeof payload.y === 'number' && Number.isFinite(payload.y)
            ? payload.y
            : appConfig.shell.topInsetPx;
        const height =
          typeof payload.height === 'number' && Number.isFinite(payload.height)
            ? payload.height
            : 0;
        this.#shellViewportBoundsByShellContents.set(event.sender, {
          x: Math.max(0, Math.floor(x)),
          y: Math.max(0, Math.floor(y)),
          width: Math.floor(payload.width),
          height: Math.max(0, Math.floor(height)),
        });
        const shellWin = BrowserWindow.fromWebContents(event.sender);
        if (shellWin)
          this.#relayoutEmbeddedViewsByShellWindow.get(shellWin)?.();
      },
    );

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
        const wid = viewId as EmbeddedShellWindowId;
        if (!listShellIntegrableAppIds().includes(wid)) return false;
        if (usesBrowserViewEmbed() && !this.#embeddedViewsById.has(wid)) {
          return false;
        }
        if (
          !usesBrowserViewEmbed() &&
          !listEmbeddedWindowIds().includes(wid as EmbeddedWindowId)
        ) {
          return false;
        }
        if (!this.#enabledEmbeddedViewOrder.includes(wid)) {
          this.#enabledEmbeddedViewOrder.push(wid);
        }
        return this.setActiveEmbeddedView(wid as EmbeddedWindowId);
      },
    );

    ipcMain.handle(
      'shell:disable-embedded-view',
      (_event, payload: { viewId?: string }) => {
        const viewId = payload?.viewId;
        if (typeof viewId !== 'string' || !viewId) return false;
        const wid = viewId as EmbeddedShellWindowId;
        if (!listShellIntegrableAppIds().includes(wid)) return false;
        if (usesBrowserViewEmbed() && !this.#embeddedViewsById.has(wid)) {
          return false;
        }
        if (
          !usesBrowserViewEmbed() &&
          !listEmbeddedWindowIds().includes(wid as EmbeddedWindowId)
        ) {
          return false;
        }
        if (!this.#enabledEmbeddedViewOrder.includes(wid)) return true;
        this.#enabledEmbeddedViewOrder = this.#enabledEmbeddedViewOrder.filter(
          (id) => id !== wid,
        );
        if (this.#activeEmbeddedViewId === wid) {
          this.#activeEmbeddedViewId =
            this.getAvailableEmbeddedViewIds()[0] ?? null;
          if (this.#mainWindow) {
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
            this.#enabledEmbeddedViewOrder.includes(id as EmbeddedWindowId) &&
            (usesBrowserViewEmbed()
              ? this.#embeddedViewsById.has(id as EmbeddedWindowId)
              : listEmbeddedWindowIds().includes(id as EmbeddedWindowId)),
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
          this.#relayoutEmbeddedViewsByShellWindow.get(this.#mainWindow)?.();
        }
        return true;
      },
    );

    ipcMain.on(
      'shell:embedded-content-visible',
      (event, payload: { visible?: boolean }) => {
        if (!usesBrowserViewEmbed()) return;
        if (BrowserWindow.fromWebContents(event.sender) !== this.#mainWindow) {
          return;
        }
        this.#applyEmbeddedContentVisible(payload?.visible !== false);
      },
    );

    ipcMain.handle(
      'shell:set-embedded-content-visible',
      (_event, payload: { visible?: boolean }) => {
        if (!usesBrowserViewEmbed()) return true;
        this.#applyEmbeddedContentVisible(payload?.visible !== false);
        return true;
      },
    );
  }

  createShellWindow(): BrowserWindow {
    const cfg = appConfig.windows.main;
    if (!cfg) throw new Error('Main window config not found');
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
      if (!usesBrowserViewEmbed()) return;
      this.#layoutEmbeddedBrowserViews(win, embeddedViews);
    };
    this.#relayoutEmbeddedViewsByShellWindow.set(win, relayoutEmbedded);

    if (usesBrowserViewEmbed()) {
      for (const id of listEmbeddedWindowIds()) {
        const wcfg = resolveRendererEntry(id);
        const view = new BrowserView({
          webPreferences: {
            ...rendererWebPreferences(wcfg.preload as string),
            session: win.webContents.session,
            // 子应用切走时尺寸为 0 会触发 Chromium 节流；关闭后可即时恢复显示
            backgroundThrottling: false,
          },
        });
        this.#applySecurityRules(view.webContents);
        loadRendererContents(view.webContents, id);
        embeddedViews.set(id, view);
      }
      this.#embeddedViewsById = embeddedViews;
    } else {
      this.#embeddedViewsById = new Map();
    }
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
    if (usesBrowserViewEmbed()) {
      const view = this.#embeddedViewsById.get(viewId);
      if (!view) return false;
    } else if (!listEmbeddedWindowIds().includes(viewId)) {
      return false;
    }
    this.#activeEmbeddedViewId = viewId;
    if (this.#mainWindow) {
      this.#relayoutEmbeddedViewsByShellWindow.get(this.#mainWindow)?.();
    }
    return true;
  }

  broadcast(channel: string, payload: unknown = null): void {
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
      // 登录窗口关闭时通知渲染进程，由 IpcAuthModule 判断会话状态
      this.#mainWindow?.webContents.send('auth:login-dismissed');
      this.broadcast('auth:login-dismissed');
    });
    this.#loginWindow = win;
  }

  #applyEmbeddedContentVisible(visible: boolean): void {
    this.#embeddedContentVisible = visible;
    if (this.#mainWindow) {
      this.#relayoutEmbeddedViewsByShellWindow.get(this.#mainWindow)?.();
    }
  }

  #layoutEmbeddedBrowserViews(
    win: BrowserWindow,
    views: Map<EmbeddedWindowId, BrowserView>,
  ): void {
    if (!usesBrowserViewEmbed()) return;
    const top = appConfig.shell.topInsetPx;
    const { width, height } = win.getContentBounds();
    const bounds = this.#shellViewportBoundsByShellContents.get(
      win.webContents,
    );
    const w = Math.max(0, bounds?.width ?? width);
    const x = Math.max(0, bounds?.x ?? 0);
    const y = Math.max(0, bounds?.y ?? top + SHELL_TAGS_HEIGHT_PX);
    const h = Math.max(
      0,
      bounds?.height && bounds.height > 0 ? bounds.height : height - y,
    );
    const viewX = x;
    const viewW = w;

    const attached = new Set(win.getBrowserViews());
    let topView: BrowserView | null = null;

    for (const [id, view] of views) {
      const isActive = this.#activeEmbeddedViewId === id;
      const show = this.#embeddedContentVisible && isActive;
      if (show) {
        if (!attached.has(view)) {
          win.addBrowserView(view);
          attached.add(view);
        }
        view.setBounds({ x: viewX, y, width: viewW, height: h });
        topView = view;
      } else if (attached.has(view)) {
        win.removeBrowserView(view);
        attached.delete(view);
      }
    }

    if (topView) {
      win.setTopBrowserView(topView);
    }
  }

  #applySecurityRules(contents: WebContents): void {
    for (const rule of this.#securityRules) {
      rule.applyRule(contents);
    }
  }
}
