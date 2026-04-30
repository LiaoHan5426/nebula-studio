import type { AppInitConfig } from './types';
import { createModuleRunner } from './ModuleRunner.js';
import { terminateAppOnLastWindowClose } from './modules/ApplicationTerminatorOnLastWindowClose';
import { autoUpdater } from './modules/AutoUpdater';
import { allowInternalOrigins } from './modules/BlockNotAllowedOrigins';
import { allowExternalUrls } from './modules/ExternalUrls';
import { hardwareAccelerationMode } from './modules/HardwareAccelerationModule';
import { disallowMultipleAppInstance } from './modules/SingleInstanceApp';
import { createWindowManagerModule } from './modules/WindowManager';
import { useLogger, isDevelopment } from '@nebula-studio/utils';

const { appLifecycleLogger } = useLogger();

export async function initApp(initConfig: AppInitConfig): Promise<void> {
  appLifecycleLogger.info('Initializing app with config:', initConfig);
  await createModuleRunner()
    .init(
      createWindowManagerModule({
        initConfig,
        openDevTools: isDevelopment,
      }),
    )
    .init(disallowMultipleAppInstance())
    .init(terminateAppOnLastWindowClose())
    .init(hardwareAccelerationMode({ enable: false }))
    .init(autoUpdater())

    // Install DevTools extension if needed
    // .init(chromeDevToolsExtension({extension: 'VUEJS3_DEVTOOLS'}))

    // Security
    .init(
      allowInternalOrigins(
        new Set(
          initConfig.renderer instanceof URL
            ? [initConfig.renderer.origin]
            : [],
        ),
      ),
    )
    .init(
      allowExternalUrls(
        new Set(
          initConfig.renderer instanceof URL
            ? ['https://vite.dev', 'https://react.dev']
            : [],
        ),
      ),
    )
    .run();
}
