import type { ModuleContext } from '../../types/index';
import type { ZoomManager } from './ZoomManager';

import process from 'node:process';

import deepmerge from '@fastify/deepmerge';
import electron from 'electron';
import type { BrowserWindow as BrowserWindowType } from 'electron';

import { WindowStateManager } from './WindowStateManager';
import { createZoomManager } from './ZoomManager';
import { useLogger } from '@nebula-studio/utils';

const { appLifecycleLogger } = useLogger();
const { BrowserWindow } = electron;

const WINDOW_LOAD_TIMEOUT_MS = 3000; // 1 second timeout
type WindowOptions = Electron.BrowserWindowConstructorOptions;
export interface WindowConfig {
  options?: Partial<WindowOptions>;
  preload: { path: string };
  renderer: URL | { path: string };
}

/**
 * The expected shape of the initConfig object for the WindowManager.
 */
interface WindowManagerInitConfig {
  mainWindowName?: string;
  windows: Record<string, WindowConfig>;
}

class WindowManagerHelper {
  readonly #defaultWindowOptions: undefined | WindowOptions;
  readonly #mainWindowName: string;
  readonly #openDevTools: boolean;
  /** Stores all available window configurations, keyed by name. */
  readonly #windowConfigs: Record<string, WindowConfig>;
  /** Registry of created windows, keyed by window name */
  readonly #windowRegistry: Map<string, BrowserWindowType> = new Map();

  /** Stores WindowStateManager instances for each window type */
  readonly #windowStateManagers: Record<string, WindowStateManager> = {};
  /** Handles zoom functionality for all windows */
  readonly #zoomManager: ZoomManager;

  constructor({
    initConfig,
    openDevTools = false,
    defaultWindowOptions,
  }: {
    defaultWindowOptions?: WindowOptions;
    initConfig: WindowManagerInitConfig;
    openDevTools?: boolean;
  }) {
    this.#windowConfigs = initConfig.windows;
    this.#openDevTools = openDevTools;
    this.#zoomManager = createZoomManager();
    this.#mainWindowName = initConfig.mainWindowName ?? 'main';
    this.#defaultWindowOptions = defaultWindowOptions;
  }

  /**
   * Creates a new BrowserWindow based on a named configuration.
   * @param windowName The key for the window configuration (e.g., 'main', 'settings').
   * @param options
   */
  async createWindow(
    windowName: string,
    options?: WindowOptions,
  ): Promise<BrowserWindowType> {
    const config = this.#windowConfigs[windowName];
    if (!config) {
      throw new Error(
        `[WindowManager] Configuration for window "${windowName}" not found.`,
      );
    }

    /**
     * Get window state manager first to use saved dimensions during creation.
     * Each window gets its own WindowStateManager with a unique state file.
     */
    const windowStateManager = this.getWindowStateManager(windowName);

    // Create a deepmerge function for merging options
    const merge = deepmerge();

    // Base options for all windows
    const baseOptions: WindowOptions = {
      show: false, // Use 'ready-to-show' event to show the window gracefully
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false, // Required for preload scripts that use Node.js APIs
        webviewTag: false,
        preload: config.preload.path,
        // Give each window its own session to prevent zoom sharing
        partition: `window-${windowName}`,
      },
    };

    // Merge options in steps: base -> default -> config options -> runtime options
    const withDefaults = merge(baseOptions, this.#defaultWindowOptions || {});
    const withConfigOptions = merge(withDefaults, config.options || {});
    const mergedOptions = merge(withConfigOptions, options || {});

    const browserWindow = new BrowserWindow({
      ...mergedOptions,
      x: windowStateManager.x || mergedOptions.x,
      y: windowStateManager.y || mergedOptions.y,
      width: windowStateManager.width || mergedOptions.width,
      height: windowStateManager.height || mergedOptions.height,
      webPreferences: {
        ...mergedOptions.webPreferences,
        zoomFactor:
          windowStateManager.zoomFactor ??
          mergedOptions.webPreferences?.zoomFactor,
      },
    });

    // Manage window state (this will set up event listeners for state changes)
    windowStateManager.manage(browserWindow);

    // Register window with zoom manager for zoom functionality
    this.#zoomManager.registerWindow(
      browserWindow,
      windowName,
      windowStateManager,
    );

    // Register window in our registry for quick lookup
    this.#windowRegistry.set(windowName, browserWindow);

    // Clean up registry when window is closed
    browserWindow.on('closed', () => {
      this.#windowRegistry.delete(windowName);
    });

    // Load the renderer content
    await (config.renderer instanceof URL
      ? browserWindow.loadURL(config.renderer.href)
      : browserWindow.loadFile(config.renderer.path));

    const showWindow = () => {
      if (!browserWindow.isDestroyed()) {
        browserWindow.show();
      }
      if (this.#openDevTools) {
        browserWindow.webContents.openDevTools();
      }
    };

    // In createWindow method, after loadURL/loadFile
    const showTimeout = setTimeout(() => {
      appLifecycleLogger.warn(
        `[WindowManager] Warning: Window ${windowName} taking too long to load, showing anyway`,
      );
      showWindow();
    }, WINDOW_LOAD_TIMEOUT_MS);

    browserWindow.once('ready-to-show', () => {
      clearTimeout(showTimeout);
      showWindow();
    });

    // Also add error handling
    browserWindow.webContents.on(
      'did-fail-load',
      (_event, _errorCode, errorDescription, validatedURL) => {
        appLifecycleLogger.error(
          `[WindowManager] Failed to load ${validatedURL}:`,
          errorDescription,
        );
        clearTimeout(showTimeout);
        // Still show the window so user can see the error
        browserWindow.show();
      },
    );

    // Close all other windows when the main window is closed
    if (windowName === this.#mainWindowName) {
      browserWindow.on('closed', () => {
        const allWindows = BrowserWindow.getAllWindows();
        for (const win of allWindows) {
          if (win !== browserWindow && !win.isDestroyed()) {
            win.close();
          }
        }
      });
    }

    return browserWindow;
  }

  async getWindow(windowName: string): Promise<BrowserWindowType | undefined> {
    const registeredWindow = this.#windowRegistry.get(windowName);

    // If we have a registered window, and it's not destroyed, return it
    if (registeredWindow && !registeredWindow.isDestroyed()) {
      return registeredWindow;
    }

    // If the registered window was destroyed, clean it up from registry
    if (registeredWindow && registeredWindow.isDestroyed()) {
      this.#windowRegistry.delete(windowName);
    }

    return undefined;
  }

  getZoomMenuItems(): Electron.MenuItemConstructorOptions[] {
    return this.#zoomManager.getZoomMenuItems();
  }

  async init({ app }: ModuleContext): Promise<BrowserWindowType> {
    await app.whenReady();

    // Create the main window on startup
    const mainWindow = await this.restoreOrCreateWindow(true);

    // Re-create main window if app is activated and no windows are open (macOS)
    app.on('activate', () => this.restoreOrCreateWindow(true));

    // Focus existing main window if a second instance is started
    app.on('second-instance', () => this.restoreOrCreateWindow(true));

    return mainWindow;
  }

  async openWindow(
    name: string,
    options?: WindowOptions,
  ): Promise<BrowserWindowType> {
    const win =
      (await this.getWindow(name)) ?? (await this.createWindow(name, options));
    win.show();
    win.focus();
    return win;
  }

  /**
   * Restores the main window if it's minimized, or creates a new one if none exist.
   * @param show - Whether to show and focus the window.
   */
  async restoreOrCreateWindow(show = false): Promise<BrowserWindowType> {
    // Try to get the main window from our registry first
    let window = await this.getWindow(this.#mainWindowName);

    if (window === undefined) {
      window = await this.createWindow(this.#mainWindowName);
    }

    if (!show) {
      return window;
    }

    if (window.isMinimized()) {
      window.restore();
    }

    window.focus();
    return window;
  }

  /**
   * Gets or creates a WindowStateManager for the specified window name.
   */
  private getWindowStateManager(windowName: string): WindowStateManager {
    let manager = this.#windowStateManagers[windowName];

    if (!manager) {
      manager = new WindowStateManager({
        file: `${windowName}-window-state.json`,
        path: process.cwd(),
      });
      this.#windowStateManagers[windowName] = manager;
    }

    return manager;
  }
}

export { WindowManagerHelper };
