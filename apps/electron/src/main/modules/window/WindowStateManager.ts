import type { BrowserWindow } from 'electron';

import type { ConfigManager } from '../ConfigManager';

interface WindowBoundsState {
  width: number;
  height: number;
}

interface WindowStateSchema {
  mainWindowBounds?: WindowBoundsState;
}

export class WindowStateManager {
  readonly #configManager: ConfigManager;

  constructor(configManager: ConfigManager) {
    this.#configManager = configManager;
  }

  bindMainWindowPersist(win: BrowserWindow): void {
    const saveBounds = (): void => {
      const { width, height } = win.getBounds();
      const state: WindowStateSchema = {
        mainWindowBounds: { width, height },
      };
      this.#configManager.set('windowState', state);
    };
    win.on('resize', saveBounds);
  }

  getMainWindowBounds(): undefined | WindowBoundsState {
    return this.#configManager.get<WindowStateSchema>('windowState')
      ?.mainWindowBounds;
  }
}
