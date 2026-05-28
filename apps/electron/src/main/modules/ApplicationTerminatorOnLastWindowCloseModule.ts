import type { MainModule, MainModuleContext } from '../bootstrap/MainModule';

export class ApplicationTerminatorOnLastWindowCloseModule implements MainModule {
  readonly name = 'ApplicationTerminatorOnLastWindowClose';

  setup(context: MainModuleContext): void {
    context.app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        context.logger.info('No windows left. Terminating app on non-macOS.');
        context.app.quit();
      }
    });
  }
}
