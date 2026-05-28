import type { App } from 'electron';
import type { ConfigManager } from '../modules/ConfigManager';
import type { ApplicationLogger } from '../modules/ApplicationLogger';
import type { RuntimePluginManager } from '../modules/RuntimePluginManager';
import type { WindowManager } from '../modules/window/WindowManager';

export interface MainModuleContext {
  app: App;
  logger: ApplicationLogger;
  configManager: ConfigManager;
  pluginManager: RuntimePluginManager;
  windowManager: WindowManager;
}

export interface MainModule {
  readonly name: string;
  setup(context: MainModuleContext): Promise<void> | void;
}
