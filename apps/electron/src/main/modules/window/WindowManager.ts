import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { BrowserView, BrowserWindow, ipcMain, shell } from 'electron';
import type { WebContents } from 'electron';
import { is } from '@electron-toolkit/utils';
import icon from '../../../../resources/icon.png?asset';
import appConfig from '../../../../app.config';
import type { AbstractSecurityRule } from '../security/AbstractSecurityRule';

type WindowId = keyof typeof appConfig.windows;
type EmbeddedWindowId = Exclude<WindowId, 'main'>;

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

function loadRendererContents(contents: WebContents, windowId: WindowId): void {
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
  #activeEmbeddedViewId: EmbeddedWindowId | null = null;
  #mainWindow: BrowserWindow | null = null;

  constructor(securityRules: AbstractSecurityRule[] = []) {
    this.#securityRules = securityRules;
  }

  registerCoreIpc(): void {
    ipcMain.on('ping', () => console.log('pong'));

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
    }));

    ipcMain.handle(
      'shell:set-active-view',
      (_event, payload: { viewId?: string }) => {
        const viewId = payload?.viewId;
        if (typeof viewId !== 'string' || !viewId) return false;
        return this.setActiveEmbeddedView(viewId as EmbeddedWindowId);
      },
    );
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

    for (const id of Object.keys(appConfig.windows) as WindowId[]) {
      if (id === 'main') continue;
      const wcfg = appConfig.windows[id];
      const view = new BrowserView({
        webPreferences: {
          ...rendererWebPreferences(wcfg.preload),
          session: win.webContents.session,
        },
      });
      this.#applySecurityRules(view.webContents);
      loadRendererContents(view.webContents, id);
      win.addBrowserView(view);
      embeddedViews.set(id, view);
    }
    this.#embeddedViewsById = embeddedViews;
    this.#activeEmbeddedViewId = embeddedViews.keys().next().value ?? null;

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
    return Array.from(this.#embeddedViewsById.keys());
  }

  getActiveEmbeddedViewId(): EmbeddedWindowId | null {
    return this.#activeEmbeddedViewId;
  }

  setActiveEmbeddedView(viewId: EmbeddedWindowId): boolean {
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
      view.setBounds({
        x: 0,
        y: top,
        width: isActive ? w : 0,
        height: isActive ? h : 0,
      });
    }
  }

  #applySecurityRules(contents: WebContents): void {
    for (const rule of this.#securityRules) {
      rule.applyRule(contents);
    }
  }
}
