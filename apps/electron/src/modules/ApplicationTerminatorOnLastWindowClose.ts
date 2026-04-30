import type { AppModule, ModuleContext } from '../types';
import { useLogger } from '@nebula-studio/utils';

const { appLifecycleLogger } = useLogger();
class ApplicationTerminatorOnLastWindowClose implements AppModule {
  enable({ app }: ModuleContext): Promise<void> | void {
    app.on('window-all-closed', () => {
      appLifecycleLogger.warn('window-all-closed');
      // On macOS, keep the app running even when all windows are closed
      if (process.platform !== 'darwin') {
        appLifecycleLogger.info('quitting app on non-darwin platform');
        app.quit();
      }
    });
  }
}

export function terminateAppOnLastWindowClose(
  ...args: ConstructorParameters<typeof ApplicationTerminatorOnLastWindowClose>
): ApplicationTerminatorOnLastWindowClose {
  return new ApplicationTerminatorOnLastWindowClose(...args);
}
