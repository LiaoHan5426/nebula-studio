import { GENERATED_STANDALONE_APPS } from '@nebula-studio/contracts/generated';

import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { bootstrapShellIntegratedApps } from '@nebula-studio-renderer/main/platform/integrated-apps';
import { app } from 'electron';

import { MainAppLauncher } from './bootstrap/MainAppLauncher';
import { persistLowCodeOfflineLockfile } from './federation/lowCodeOfflineLockfile';
import {
  attachNebulaRemoteProtocolHandler,
  nebulaRemoteOrigin,
  resolveNebulaRemoteDistRoots,
} from './federation/registerNebulaRemoteProtocol';
import { AppearanceSettingsModule } from './modules/AppearanceSettingsModule';
import { ApplicationLogger } from './modules/ApplicationLogger';
import { ApplicationTerminatorOnLastWindowCloseModule } from './modules/ApplicationTerminatorOnLastWindowCloseModule';
import { AutoUpdaterModule } from './modules/AutoUpdaterModule';
import { ConfigManager } from './modules/ConfigManager';
import { IpcAuthModule } from './modules/IpcAuthModule';
import { IpcNotificationModule } from './modules/IpcNotificationModule';
import { RuntimePluginManager } from './modules/RuntimePluginManager';
import { allowInternalOrigins } from './modules/security/BlockNotAllowedOrigins';
import { SingleInstanceAppModule } from './modules/SingleInstanceAppModule';
import { WindowManager } from './modules/window/WindowManager';
import { WindowManagerModule } from './modules/window/WindowManagerModule';

app.whenReady().then(async () => {
  bootstrapShellIntegratedApps();

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

  const allowedOrigins = new Set<string>([
    'file://',
    nebulaRemoteOrigin('docs'),
    nebulaRemoteOrigin('integration'),
    nebulaRemoteOrigin('low-code-studio'),
    nebulaRemoteOrigin('settings'),
  ]);
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    allowedOrigins.add(new URL(process.env.ELECTRON_RENDERER_URL).origin);
    allowedOrigins.add(GENERATED_STANDALONE_APPS.docs.baseUrl);
    allowedOrigins.add(GENERATED_STANDALONE_APPS.settings.baseUrl);
    allowedOrigins.add(GENERATED_STANDALONE_APPS.integration.baseUrl);
  }

  attachNebulaRemoteProtocolHandler();
  persistLowCodeOfflineLockfile(
    app.getPath('userData'),
    resolveNebulaRemoteDistRoots(),
  );

  const windowManager = new WindowManager([
    allowInternalOrigins(allowedOrigins),
  ]);
  windowManager.registerCoreIpc();

  const launcher = new MainAppLauncher()
    .use(new SingleInstanceAppModule())
    .use(new AppearanceSettingsModule())
    .use(new IpcAuthModule())
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
