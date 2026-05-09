import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { app, shell, BrowserWindow, BrowserView, ipcMain } from 'electron';
import type { WebContents } from 'electron';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import appConfig from '../../app.config';

type WindowId = keyof typeof appConfig.windows;

/** 必须使用绝对路径；子窗口 BrowserView 对 preload 默认行为与主窗口不完全一致，需显式开启 contextIsolation 才能使用 contextBridge。 */
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

function devRendererBaseUrl(): string | undefined {
  return (
    process.env.ELECTRON_RENDERER_URL ??
    process.env.ELECTRON_RENDERER_URL_MAIN ??
    process.env.ELECTRON_RENDERER_URL_main
  );
}

/** 加载 `@nebula-studio-renderer/<windowId>`（与 `src/renderer/boot.ts` 中 `?renderer=` 一致） */
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

/**
 * 嵌入 BrowserView 的宽度须与壳层 WebContents 可视区域一致。
 * `BrowserWindow.getContentBounds()` 在 DevTools 右侧停靠时仍是整窗客户区宽度；
 * 若再减去固定像素会与 DevTools 实际占位「双重扣除」，出现中间黑缝。
 * 壳层 `window.innerWidth` 会随停靠 DevTools 变窄，由渲染进程通过 IPC 上报。
 */
const shellViewportWidthByShellContents = new WeakMap<WebContents, number>();
const relayoutEmbeddedViewsByShellWindow = new WeakMap<
  BrowserWindow,
  () => void
>();

function layoutEmbeddedBrowserViews(
  win: BrowserWindow,
  views: Map<Exclude<WindowId, 'main'>, BrowserView>,
): void {
  const top = appConfig.shell.topInsetPx;
  const { width, height } = win.getContentBounds();
  const shellW = shellViewportWidthByShellContents.get(win.webContents);
  const w = Math.max(0, shellW ?? width);
  const h = Math.max(0, height - top);
  for (const view of views.values()) {
    view.setBounds({ x: 0, y: top, width: w, height: h });
  }
}

function createShellWindow(): BrowserWindow {
  const cfg = appConfig.windows.main;
  const win = new BrowserWindow({
    width: 960,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: rendererWebPreferences(cfg.preload),
  });

  loadRendererContents(win.webContents, 'main');

  const embeddedViews = new Map<Exclude<WindowId, 'main'>, BrowserView>();

  const relayoutEmbedded = (): void => {
    layoutEmbeddedBrowserViews(win, embeddedViews);
  };

  relayoutEmbeddedViewsByShellWindow.set(win, relayoutEmbedded);

  for (const id of Object.keys(appConfig.windows) as WindowId[]) {
    if (id === 'main') continue;
    const wcfg = appConfig.windows[id];
    const view = new BrowserView({
      webPreferences: {
        ...rendererWebPreferences(wcfg.preload),
        session: win.webContents.session,
      },
    });
    loadRendererContents(view.webContents, id);
    win.addBrowserView(view);
    embeddedViews.set(id, view);
  }

  if (is.dev) {
    win.webContents.once('did-finish-load', () => {
      win.webContents.openDevTools({ mode: 'right' });
      relayoutEmbedded();
    });
  }

  win.on('resize', () => {
    relayoutEmbedded();
  });

  win.on('ready-to-show', () => {
    relayoutEmbedded();
    win.show();
  });

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  return win;
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on('ping', () => console.log('pong'));

  ipcMain.on('shell-viewport', (event, payload: { width: number }) => {
    if (typeof payload?.width !== 'number' || !Number.isFinite(payload.width))
      return;
    shellViewportWidthByShellContents.set(
      event.sender,
      Math.floor(payload.width),
    );
    const shellWin = BrowserWindow.fromWebContents(event.sender);
    if (shellWin) relayoutEmbeddedViewsByShellWindow.get(shellWin)?.();
  });

  createShellWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createShellWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
