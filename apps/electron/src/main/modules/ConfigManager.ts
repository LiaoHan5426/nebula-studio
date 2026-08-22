import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { app } from 'electron';
import { parse, stringify } from 'yaml';

import type { ThemePreference } from '@nebula-studio/tokens';
import {
  mergeThemePreference,
  PRODUCT_DEFAULT_PREFERENCE,
} from '@nebula-studio/tokens';

type ConfigShape = Record<string, unknown>;
interface LogConfig {
  dir?: string;
}

type ThemeMode = 'dark' | 'light' | 'system';

interface UiConfig {
  locale?: string;
  theme?: ThemeMode;
  themePreference?: ThemePreference;
}

interface NebulaConfig {
  log?: LogConfig;
  ui?: UiConfig;
}

function isThemePreference(value: unknown): value is ThemePreference {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as ThemePreference;
  return (
    record.colorScheme === 'dark' ||
    record.colorScheme === 'light' ||
    record.colorScheme === 'system'
  );
}

export class ConfigManager {
  #cache: NebulaConfig = {};
  readonly #filePath: string;

  constructor(fileName = 'nebula.config.yaml') {
    this.#filePath = this.#resolveConfigPath(fileName);
    this.#load();
  }

  get<T = unknown>(key: string): T | undefined {
    return (this.#cache as ConfigShape)[key] as T | undefined;
  }

  getLocale(): string {
    const raw = this.#cache.ui?.locale;
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
    return 'zh-CN';
  }

  getLogDir(): string | undefined {
    if (
      typeof this.#cache.log?.dir === 'string' &&
      this.#cache.log.dir.trim()
    ) {
      return this.#cache.log.dir.trim();
    }
    return undefined;
  }

  getTheme(): ThemeMode {
    return this.getThemePreference().colorScheme;
  }

  getThemePreference(): ThemePreference {
    const stored = this.#cache.ui?.themePreference;
    if (isThemePreference(stored)) {
      return mergeThemePreference(stored);
    }
    const legacy = this.#cache.ui?.theme;
    if (legacy === 'light' || legacy === 'dark' || legacy === 'system') {
      return mergeThemePreference({ colorScheme: legacy });
    }
    return PRODUCT_DEFAULT_PREFERENCE;
  }

  set(key: string, value: unknown): void {
    (this.#cache as ConfigShape)[key] = value;
    this.#save();
  }

  setLocale(locale: string): void {
    const normalized = locale.trim() || 'zh-CN';
    this.#cache.ui = {
      ...this.#cache.ui,
      locale: normalized,
    };
    this.#save();
  }

  setLogDir(dir: string): void {
    const normalized = dir.trim();
    this.#cache.log = {
      ...this.#cache.log,
      dir: normalized,
    };
    this.#save();
  }

  setTheme(theme: ThemeMode): void {
    this.setThemePreference({
      ...this.getThemePreference(),
      colorScheme: theme,
    });
  }

  setThemePreference(preference: ThemePreference): void {
    const next = mergeThemePreference(preference);
    this.#cache.ui = {
      ...this.#cache.ui,
      theme: next.colorScheme,
      themePreference: next,
    };
    this.#save();
  }

  #load(): void {
    try {
      const raw = readFileSync(this.#filePath, 'utf-8');
      this.#cache = parse(raw) as NebulaConfig;
    } catch {
      this.#cache = {};
    }
  }

  #resolveConfigPath(fileName: string): string {
    const installConfigPath = join(
      dirname(process.execPath),
      'config',
      fileName,
    );
    const devConfigPath = join(app.getAppPath(), 'public', 'config', fileName);
    const devFallbackConfigPath = join(
      dirname(app.getAppPath()),
      'public',
      'config',
      fileName,
    );
    const candidates = app.isPackaged
      ? [installConfigPath]
      : [devConfigPath, devFallbackConfigPath, installConfigPath];

    const existing = candidates.find((p) => existsSync(p));
    return existing ?? installConfigPath;
  }

  #save(): void {
    mkdirSync(dirname(this.#filePath), { recursive: true });
    writeFileSync(this.#filePath, stringify(this.#cache), 'utf-8');
  }
}
