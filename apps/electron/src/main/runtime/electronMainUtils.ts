import type { BrowserWindow, WebContents } from 'electron';

import { app } from 'electron';

/** Development when the app is not packaged (electron-vite / electron-builder). */
export const is = {
  get dev(): boolean {
    return !app.isPackaged;
  },
};

const isWindows = process.platform === 'win32';

/**
 * Thin wrappers over official Electron main APIs.
 * Replaces `@electron-toolkit/utils` for the subset this host uses.
 */
export const electronApp = {
  /**
   * Windows toast / jump-list identity. In development Electron expects
   * `process.execPath`; packaged builds use the given product id.
   * @see https://www.electronjs.org/docs/latest/tutorial/notifications#windows
   */
  setAppUserModelId(id: string): void {
    if (!isWindows) {
      return;
    }
    app.setAppUserModelId(is.dev ? process.execPath : id);
  },
};

/** IPC send that no-ops when the target window/webContents is already destroyed. */
export function sendToWebContents(
  contents: null | undefined | WebContents,
  channel: string,
  ...args: unknown[]
): void {
  if (!contents || contents.isDestroyed()) {
    return;
  }
  contents.send(channel, ...args);
}

export function sendToWindow(
  win: BrowserWindow | null | undefined,
  channel: string,
  ...args: unknown[]
): void {
  if (!win || win.isDestroyed()) {
    return;
  }
  sendToWebContents(win.webContents, channel, ...args);
}

type ShortcutOptions = {
  escToCloseWindow?: boolean;
  zoom?: boolean;
};

export const optimizer = {
  /**
   * Dev: F12 toggles DevTools.
   * Prod: block reload / DevTools shortcuts; optionally ESC close and zoom.
   */
  watchWindowShortcuts(
    window: BrowserWindow,
    shortcutOptions?: ShortcutOptions,
  ): void {
    const { webContents } = window;
    const { escToCloseWindow = false, zoom = false } = shortcutOptions ?? {};

    webContents.on('before-input-event', (event, input) => {
      if (input.type !== 'keyDown') {
        return;
      }

      if (!is.dev) {
        if (input.code === 'KeyR' && (input.control || input.meta)) {
          event.preventDefault();
        }
        if (
          input.code === 'KeyI' &&
          ((input.alt && input.meta) || (input.control && input.shift))
        ) {
          event.preventDefault();
        }
      } else if (input.code === 'F12') {
        if (webContents.isDevToolsOpened()) {
          webContents.closeDevTools();
        } else {
          webContents.openDevTools({ mode: 'undocked' });
        }
      }

      if (
        escToCloseWindow &&
        input.code === 'Escape' &&
        input.key !== 'Process'
      ) {
        window.close();
        event.preventDefault();
      }

      if (!zoom) {
        if (input.code === 'Minus' && (input.control || input.meta)) {
          event.preventDefault();
        }
        if (
          input.code === 'Equal' &&
          input.shift &&
          (input.control || input.meta)
        ) {
          event.preventDefault();
        }
      }
    });
  },
};
