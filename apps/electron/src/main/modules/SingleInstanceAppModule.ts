import { app } from 'electron';
import { is } from '@electron-toolkit/utils';
import type { MainModule, MainModuleContext } from '../bootstrap/MainModule';

export class SingleInstanceAppModule implements MainModule {
  readonly name = 'SingleInstanceApp';

  setup(context: MainModuleContext): void {
    if (is.dev) {
      context.logger.info(
        'Single instance lock is skipped in development mode.',
      );
      return;
    }

    const gotLock = app.requestSingleInstanceLock();
    if (!gotLock) {
      context.logger.warn(
        'Another instance is already running, quitting current.',
      );
      app.quit();
      return;
    }

    app.on('second-instance', () => {
      context.logger.info(
        'Second instance detected, focusing existing window.',
      );
      context.windowManager.focusMainWindow();
    });
  }
}
