import type { ThemePreference } from '@nebula-studio/tokens';

import type { MainModule, MainModuleContext } from '../bootstrap/MainModule';

import { resolveTheme } from '@nebula-studio/tokens';

import { ipcMain, nativeTheme } from 'electron';

import { is } from '../runtime/electronMainUtils';

type ThemeMode = 'dark' | 'light' | 'system';

function normalizeTheme(theme: unknown): ThemeMode {
  if (theme === 'light' || theme === 'system') {
    return theme;
  }
  return 'dark';
}

function normalizeLocale(locale: unknown, fallback: string): string {
  if (typeof locale === 'string' && locale.trim()) return locale.trim();
  return fallback;
}

function systemScheme(): 'dark' | 'light' {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
}

function applyNativeAppearance(
  context: MainModuleContext,
  preference: ThemePreference,
): void {
  nativeTheme.themeSource = preference.colorScheme;
  const resolved = resolveTheme(preference, systemScheme());
  const bg = resolved.scheme === 'light' ? '#f6f8ff' : '#0f0f14';
  context.windowManager.getMainWindow()?.setBackgroundColor(bg);
}

export class AppearanceSettingsModule implements MainModule {
  readonly name = 'AppearanceSettings';

  setup(context: MainModuleContext): void {
    applyNativeAppearance(context, context.configManager.getThemePreference());

    ipcMain.handle('settings:theme:get', () =>
      context.configManager.getTheme(),
    );

    ipcMain.handle('settings:theme:getPreference', () =>
      context.configManager.getThemePreference(),
    );

    ipcMain.handle(
      'settings:theme:set',
      (_event, payload: { theme?: unknown }) => {
        const nextTheme = normalizeTheme(payload?.theme);
        context.configManager.setTheme(nextTheme);
        const preference = context.configManager.getThemePreference();
        applyNativeAppearance(context, preference);
        context.windowManager.broadcast('settings:theme:changed', {
          theme: nextTheme,
          preference,
        });
        context.logger.info(
          `[settings:theme] theme switched to "${nextTheme}"`,
        );
        return nextTheme;
      },
    );

    ipcMain.handle(
      'settings:theme:setPreference',
      (_event, payload: { preference?: ThemePreference }) => {
        if (payload?.preference) {
          context.configManager.setThemePreference(payload.preference);
        }
        const preference = context.configManager.getThemePreference();
        applyNativeAppearance(context, preference);
        context.windowManager.broadcast('settings:theme:changed', {
          theme: preference.colorScheme,
          preference,
        });
        return preference;
      },
    );

    ipcMain.handle('settings:locale:get', () =>
      context.configManager.getLocale(),
    );

    ipcMain.handle(
      'settings:locale:set',
      (_event, payload: { locale?: unknown }) => {
        const fallback = context.configManager.getLocale();
        const nextLocale = normalizeLocale(payload?.locale, fallback);
        context.configManager.setLocale(nextLocale);
        context.windowManager.broadcast('settings:locale:changed', {
          locale: nextLocale,
        });
        context.logger.info(
          `[settings:locale] locale switched to "${nextLocale}"`,
        );
        return nextLocale;
      },
    );

    ipcMain.handle('shell:app-mode:get', () => (is.dev ? 'dev' : 'build'));
  }
}
