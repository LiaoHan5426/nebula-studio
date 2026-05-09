import { app } from 'electron';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { MainAppLauncher } from './bootstrap/MainAppLauncher';
import { AppearanceSettingsModule } from './modules/AppearanceSettingsModule';
import { ApplicationLogger } from './modules/ApplicationLogger';
import { ApplicationTerminatorOnLastWindowCloseModule } from './modules/ApplicationTerminatorOnLastWindowCloseModule';
import { AutoUpdaterModule } from './modules/AutoUpdaterModule';
import { ConfigManager } from './modules/ConfigManager';
import { IpcNotificationModule } from './modules/IpcNotificationModule';
import { RuntimePluginManager } from './modules/RuntimePluginManager';
import { SingleInstanceAppModule } from './modules/SingleInstanceAppModule';
import { allowInternalOrigins } from './modules/security/BlockNotAllowedOrigins';
import { WindowManager } from './modules/window/WindowManager';
import { WindowManagerModule } from './modules/window/WindowManagerModule';

app.whenReady().then(async () => {
  const configManager = new ConfigManager();
  const logger = new ApplicationLogger({
    configuredLogDir: configManager.getLogDir(),
  });
  const pluginManager = new RuntimePluginManager();

  electronApp.setAppUserModelId('com.electron');
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });
  logger.info(`Log file path: ${logger.getLogFilePath()}`);

  const allowedOrigins = new Set<string>(['file://']);
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    allowedOrigins.add(new URL(process.env.ELECTRON_RENDERER_URL).origin);
  }

  const windowManager = new WindowManager([
    allowInternalOrigins(allowedOrigins),
  ]);
  windowManager.registerCoreIpc();

  const launcher = new MainAppLauncher()
    .use(new SingleInstanceAppModule())
    .use(new AppearanceSettingsModule())
    .use(new IpcNotificationModule())
    .use(new AutoUpdaterModule())
    .use(new WindowManagerModule())
    .use(new ApplicationTerminatorOnLastWindowCloseModule());

  await launcher.launch({
    app,
    logger,
    configManager,
    pluginManager,
    windowManager,
  });

  await pluginManager.startAll();
});
