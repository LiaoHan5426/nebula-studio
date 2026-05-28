import type { MainModule, MainModuleContext } from '../../bootstrap/MainModule';
import { WindowStateManager } from './WindowStateManager';

export class WindowManagerModule implements MainModule {
  readonly name = 'WindowManager';

  setup(context: MainModuleContext): void {
    const stateManager = new WindowStateManager(context.configManager);
    const win = context.windowManager.createShellWindow();
    stateManager.bindMainWindowPersist(win);

    context.app.on('activate', () => {
      if (!context.windowManager.getMainWindow()) {
        const nextWindow = context.windowManager.createShellWindow();
        stateManager.bindMainWindowPersist(nextWindow);
        return;
      }
      context.windowManager.focusMainWindow();
    });
  }
}
