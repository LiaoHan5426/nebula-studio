import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

import {
  loadDotEnvFiles,
  loadEnvironmentsConfig,
  parseEnvFile,
  resolveNebulaEnvMode,
} from '../config/environments.ts';
import { findMonorepoRoot } from '../monorepo.ts';

describe('resolveNebulaEnvMode', () => {
  it('defaults to development', () => {
    expect(resolveNebulaEnvMode(undefined, {})).toBe('development');
  });

  it('accepts product as production alias', () => {
    expect(resolveNebulaEnvMode('product', {})).toBe('production');
    expect(resolveNebulaEnvMode(undefined, { NEBULA_ENV: 'prod' })).toBe(
      'production',
    );
  });

  it('maps staging to preview', () => {
    expect(resolveNebulaEnvMode('staging', {})).toBe('preview');
  });

  it('does not auto-follow NODE_ENV unless opted in', () => {
    expect(resolveNebulaEnvMode(undefined, { NODE_ENV: 'production' })).toBe(
      'development',
    );
    expect(
      resolveNebulaEnvMode(undefined, {
        NODE_ENV: 'production',
        NEBULA_USE_VITE_MODE: '1',
      }),
    ).toBe('production');
  });
});

describe('parseEnvFile', () => {
  it('parses keys, comments, and quotes', () => {
    expect(
      parseEnvFile(`
# comment
NEBULA_PLATFORM_TARGET=http://localhost:8090
export NEBULA_CONSOLE_TARGET="http://localhost:8080"
NEBULA_EXECUTOR_TARGET='http://localhost:8088'
`),
    ).toEqual({
      NEBULA_PLATFORM_TARGET: 'http://localhost:8090',
      NEBULA_CONSOLE_TARGET: 'http://localhost:8080',
      NEBULA_EXECUTOR_TARGET: 'http://localhost:8088',
    });
  });
});

describe('loadDotEnvFiles', () => {
  it('merges Vite order and keeps process env precedence', () => {
    const root = mkdtempSync(join(tmpdir(), 'nebula-dotenv-'));
    writeFileSync(join(root, '.env'), 'NEBULA_PLATFORM_TARGET=http://base\n');
    writeFileSync(
      join(root, '.env.development'),
      'NEBULA_PLATFORM_TARGET=http://dev\nNEBULA_CONSOLE_TARGET=http://console\n',
    );
    const loaded = loadDotEnvFiles(root, 'development', {
      NEBULA_PLATFORM_TARGET: 'http://process',
    });
    expect(loaded.NEBULA_PLATFORM_TARGET).toBe('http://process');
    expect(loaded.NEBULA_CONSOLE_TARGET).toBe('http://console');
  });
});

describe('loadEnvironmentsConfig', () => {
  it('loads development from env/.env.development', () => {
    const root = findMonorepoRoot(process.cwd());
    const config = loadEnvironmentsConfig(root, {
      mode: 'development',
      env: {},
    });
    expect(config.mode).toBe('development');
    expect(config.apiTargets?.platform).toMatch(/^https?:\/\//);
    expect(config.federationDev?.host).toBeTruthy();
  });

  it('resolves production with process env overrides', () => {
    const root = findMonorepoRoot(process.cwd());
    const config = loadEnvironmentsConfig(root, {
      mode: 'production',
      env: {
        NEBULA_PLATFORM_TARGET: 'https://platform.example.com',
        NEBULA_CONSOLE_TARGET: 'https://console.example.com',
        NEBULA_EXECUTOR_TARGET: 'https://executor.example.com',
      },
    });
    expect(config.apiTargets).toEqual({
      platform: 'https://platform.example.com',
      console: 'https://console.example.com',
      executor: 'https://executor.example.com',
    });
  });
});
