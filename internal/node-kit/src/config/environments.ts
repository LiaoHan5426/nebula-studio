import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Supported Nebula environment profiles. `product` is accepted as an alias of `production`. */
export const NEBULA_ENV_MODES = [
  'development',
  'preview',
  'production',
] as const;

export type NebulaEnvMode = (typeof NEBULA_ENV_MODES)[number];

export const API_TARGET_ENV_KEYS = {
  platform: 'NEBULA_PLATFORM_TARGET',
  console: 'NEBULA_CONSOLE_TARGET',
  executor: 'NEBULA_EXECUTOR_TARGET',
} as const;

export interface EnvironmentsConfig {
  apiTargets?: Record<string, string>;
  federationDev?: {
    host: string;
    remoteCacheDir: string;
  };
  federationDevEntries?: Record<
    string,
    {
      defaultHttpEntry: string;
      expose: string;
      name: string;
      packagedHost: string;
    }
  >;
}

export interface ResolvedEnvironmentsConfig extends EnvironmentsConfig {
  mode: NebulaEnvMode;
}

const MODE_ALIASES: Record<string, NebulaEnvMode> = {
  development: 'development',
  dev: 'development',
  preview: 'preview',
  staging: 'preview',
  production: 'production',
  product: 'production',
  prod: 'production',
};

/**
 * Resolve active env profile.
 * Prefer explicit NEBULA_ENV / VITE_NEBULA_ENV so Vite `mode=production` builds
 * do not accidentally require production API secrets during local packaging.
 */
export function resolveNebulaEnvMode (
  explicit?: string,
  env: NodeJS.ProcessEnv = process.env,
): NebulaEnvMode {
  const raw = (
    explicit ??
    env.NEBULA_ENV ??
    env.VITE_NEBULA_ENV ??
    (env.NEBULA_USE_VITE_MODE === '1' || env.NEBULA_USE_VITE_MODE === 'true'
      ? (env.MODE ?? env.NODE_ENV)
      : undefined) ??
    'development'
  )
    .trim()
    .toLowerCase();

  if (raw === 'test') return 'development';
  const mapped = MODE_ALIASES[raw];
  if (!mapped) {
    throw new Error(
      `[nebula-env] Unknown environment "${raw}". Expected one of: ${NEBULA_ENV_MODES.join(', ')} (aliases: dev, product, prod, staging).`,
    );
  }
  return mapped;
}

/**
 * Parse a dotenv file body into key/value pairs (Vite-compatible subset).
 * Does not expand nested variable references.
 */
export function parseEnvFile (contents: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const exportPrefix = line.startsWith('export ')
      ? line.slice('export '.length)
      : line;
    const eq = exportPrefix.indexOf('=');
    if (eq <= 0) continue;
    const key = exportPrefix.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let value = exportPrefix.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

/**
 * Vite-style env file merge for a mode (from repo-root `env/`):
 * `.env` → `.env.local` → `.env.[mode]` → `.env.[mode].local`
 * Existing keys in `processEnv` are not overwritten (same as Vite loadEnv).
 */
export function environmentsDir (rootDir: string): string {
  return join(rootDir, 'env');
}

export function loadDotEnvFiles (
  envDir: string,
  mode: string,
  processEnv: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  const files = [
    '.env',
    '.env.local',
    `.env.${mode}`,
    `.env.${mode}.local`,
  ];
  const merged: Record<string, string> = {};
  for (const file of files) {
    const path = join(envDir, file);
    if (!existsSync(path)) continue;
    Object.assign(merged, parseEnvFile(readFileSync(path, 'utf8')));
  }
  const resolved: Record<string, string> = { ...merged };
  for (const [key, value] of Object.entries(processEnv)) {
    if (value !== undefined) resolved[key] = value;
  }
  return resolved;
}

function readFederationDevConfig (rootDir: string): EnvironmentsConfig {
  const path = join(rootDir, 'configs', 'federation-dev.json');
  if (!existsSync(path)) {
    throw new Error(`[nebula-env] Missing ${path}`);
  }
  return JSON.parse(readFileSync(path, 'utf8')) as EnvironmentsConfig;
}

function buildApiTargets (
  env: Record<string, string>,
  mode: NebulaEnvMode,
): Record<string, string> {
  const apiTargets: Record<string, string> = {};
  for (const [name, envKey] of Object.entries(API_TARGET_ENV_KEYS)) {
    const origin = env[envKey]?.trim();
    if (!origin) {
      throw new Error(
        `[nebula-env] Missing ${envKey}. Set it in env/.env.${mode} or process env.`,
      );
    }
    if (!/^https?:\/\//.test(origin)) {
      throw new Error(
        `[nebula-env] ${envKey} must be an absolute http(s) origin (got "${origin}")`,
      );
    }
    apiTargets[name] = origin.replace(/\/$/, '');
  }
  return apiTargets;
}

/** Load `env/.env*` (Vite order) plus `configs/federation-dev.json`. */
export function loadEnvironmentsConfig (
  rootDir: string,
  options: { env?: NodeJS.ProcessEnv; mode?: string } = {},
): ResolvedEnvironmentsConfig {
  const processEnv = options.env ?? process.env;
  const mode = resolveNebulaEnvMode(options.mode, processEnv);
  const env = loadDotEnvFiles(environmentsDir(rootDir), mode, processEnv);
  const federation = readFederationDevConfig(rootDir);

  const host =
    env.NEBULA_FEDERATION_DEV_HOST?.trim() ||
    federation.federationDev?.host;
  const remoteCacheDir =
    env.NEBULA_FEDERATION_REMOTE_CACHE_DIR?.trim() ||
    federation.federationDev?.remoteCacheDir;

  if (!host || !remoteCacheDir) {
    throw new Error(
      '[nebula-env] federationDev.host / remoteCacheDir missing (configs/federation-dev.json or NEBULA_FEDERATION_*)',
    );
  }

  return {
    mode,
    apiTargets: buildApiTargets(env, mode),
    federationDev: { host, remoteCacheDir },
    federationDevEntries: federation.federationDevEntries ?? {},
  };
}
