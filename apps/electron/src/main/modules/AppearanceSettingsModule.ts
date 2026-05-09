import { ipcMain, nativeTheme } from 'electron';
import { is } from '@electron-toolkit/utils';
import type { MainModule, MainModuleContext } from '../bootstrap/MainModule';

type ThemeMode = 'light' | 'dark';

function normalizeTheme(theme: unknown): ThemeMode {
  return theme === 'light' ? 'light' : 'dark';
}

function applyNativeAppearance(
  context: MainModuleContext,
  theme: ThemeMode,
): void {
  nativeTheme.themeSource = theme;
  const bg = theme === 'light' ? '#f6f8ff' : '#0f0f14';
  context.windowManager.getMainWindow()?.setBackgroundColor(bg);
}

export class AppearanceSettingsModule implements MainModule {
  readonly name = 'AppearanceSettings';

  setup(context: MainModuleContext): void {
    applyNativeAppearance(context, context.configManager.getTheme());

    ipcMain.handle('settings:theme:get', () =>
      context.configManager.getTheme(),
    );

    ipcMain.handle(
      'settings:theme:set',
      (_event, payload: { theme?: unknown }) => {
        const nextTheme = normalizeTheme(payload?.theme);
        context.configManager.setTheme(nextTheme);
        applyNativeAppearance(context, nextTheme);
        context.windowManager.broadcast('settings:theme:changed', {
          theme: nextTheme,
        });
        context.logger.info(
          `[settings:theme] theme switched to "${nextTheme}"`,
        );
        return nextTheme;
      },
    );

    ipcMain.handle('shell:app-mode:get', () => (is.dev ? 'dev' : 'build'));
  }
}
