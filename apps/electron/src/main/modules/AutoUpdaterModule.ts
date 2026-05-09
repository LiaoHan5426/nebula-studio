import type { MainModule, MainModuleContext } from '../bootstrap/MainModule';

export class AutoUpdaterModule implements MainModule {
  readonly name = 'AutoUpdater';

  setup(context: MainModuleContext): void {
    // Placeholder: keep startup sequence ready for electron-updater wiring.
    context.logger.info('AutoUpdater module initialized (placeholder).');
  }
}
