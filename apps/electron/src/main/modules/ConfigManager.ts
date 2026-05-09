import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { app } from 'electron';
import { parse, stringify } from 'yaml';

type ConfigShape = Record<string, unknown>;
interface LogConfig {
  dir?: string;
}

type ThemeMode = 'light' | 'dark';

interface UiConfig {
  theme?: ThemeMode;
}

interface NebulaConfig {
  log?: LogConfig;
  ui?: UiConfig;
}

export class ConfigManager {
  readonly #filePath: string;
  #cache: NebulaConfig = {};

  constructor(fileName = 'nebula.config.yaml') {
    this.#filePath = this.#resolveConfigPath(fileName);
    this.#load();
  }

  get<T = unknown>(key: string): T | undefined {
    return (this.#cache as ConfigShape)[key] as T | undefined;
  }

  set(key: string, value: unknown): void {
    (this.#cache as ConfigShape)[key] = value;
    this.#save();
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

  setLogDir(dir: string): void {
    const normalized = dir.trim();
    this.#cache.log = {
      ...this.#cache.log,
      dir: normalized,
    };
    this.#save();
  }

  getTheme(): ThemeMode {
    return this.#cache.ui?.theme === 'light' ? 'light' : 'dark';
  }

  setTheme(theme: ThemeMode): void {
    this.#cache.ui = {
      ...this.#cache.ui,
      theme,
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

  #save(): void {
    mkdirSync(dirname(this.#filePath), { recursive: true });
    writeFileSync(this.#filePath, stringify(this.#cache), 'utf-8');
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
}
