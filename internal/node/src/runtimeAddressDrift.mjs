import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export const RUNTIME_ADDRESS_PATTERN =
  /\b(?:https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?|(?:localhost|127\.0\.0\.1):\d+|\b(?:5173|5174|5175|5176|5177|5178|8080|8081|8088|8090)\b)/;

export const DEFAULT_ADDRESS_SCAN_ROOTS = [
  'apps',
  'e2e',
  'internal',
  'packages',
  'playwright.config.ts',
  'scripts',
];

export const DEFAULT_ADDRESS_ALLOWLIST = [
  /^configs[\\/]/,
  /^docs[\\/]/,
  /^node_modules[\\/]/,
  /^packages[\\/]core[\\/]app-shell[\\/]src[\\/]common[\\/]_generated-windows\.ts$/,
  /^packages[\\/]contracts[\\/]generated[\\/]api-namespaces\.ts$/,
  /^packages[\\/]contracts[\\/]generated[\\/]openapi\.json$/,
  /^packages[\\/]contracts[\\/]README\.md$/,
  /^packages[\\/]ui[\\/]nebula-agent[\\/]src[\\/]config[\\/]index\.ts$/,
  /^scripts[\\/]e2e[\\/]run-real-stack\.Tests\.ps1$/,
  /^scripts[\\/]smoke[\\/]/,
  /^scripts[\\/]check-generated\.mjs$/,
  /^scripts[\\/]check-boundaries\.mjs$/,
  /^scripts[\\/]check-remote-resilience\.mjs$/,
  /^internal[\\/]node[\\/]src[\\/]runtimeAddressDrift\.mjs$/,
  /^internal[\\/]node[\\/]src[\\/]__tests__[\\/]/,
  /[\\/]__tests__[\\/]/,
  /\.(?:spec|test)\.ts$/,
  /^e2e[\\/]/,
  /^apps[\\/]mf-poc-host[\\/]/,
  /^internal[\\/]vite[\\/]src[\\/]config[\\/]defineNebulaSubAppConfig\.ts$/,
  /^internal[\\/]vite[\\/]src[\\/]federation[\\/]defineNebulaRemoteConfig\.ts$/,
  /^internal[\\/]vite[\\/]src[\\/]federation[\\/]nebulaHostDevRemotesPlugin\.ts$/,
  /^packages[\\/]platform[\\/]application-runtime[\\/]src[\\/]hostCsp\.ts$/,
];

export const DEFAULT_IGNORED_DIRECTORIES = new Set([
  '.git',
  'dev-dist',
  'dist',
  'node_modules',
  'out',
  'playwright-report',
  'test-results',
]);

export const DEFAULT_SCANNED_EXTENSIONS = new Set([
  '.cjs',
  '.js',
  '.json',
  '.mjs',
  '.ps1',
  '.ts',
  '.tsx',
  '.vue',
]);

export function scanRuntimeAddressDrift(rootDir, options = {}) {
  const scanRoots = options.scanRoots ?? DEFAULT_ADDRESS_SCAN_ROOTS;
  const allowlist = options.allowlist ?? DEFAULT_ADDRESS_ALLOWLIST;
  const ignoredDirectories =
    options.ignoredDirectories ?? DEFAULT_IGNORED_DIRECTORIES;
  const scannedExtensions =
    options.scannedExtensions ?? DEFAULT_SCANNED_EXTENSIONS;
  const pattern = options.pattern ?? RUNTIME_ADDRESS_PATTERN;
  const offenders = [];
  for (const entry of scanRoots) {
    collectOffenders(join(rootDir, entry), {
      rootDir,
      allowlist,
      ignoredDirectories,
      scannedExtensions,
      pattern,
      offenders,
    });
  }
  return offenders;
}

function collectOffenders(path, ctx) {
  if (!statSync(path, { throwIfNoEntry: false })) return;
  const stat = statSync(path);
  const relativePath = relative(ctx.rootDir, path);
  if (ctx.allowlist.some((pattern) => pattern.test(relativePath))) return;
  if (stat.isDirectory()) {
    if (ctx.ignoredDirectories.has(path.split(/[\\/]/).at(-1))) return;
    for (const child of readdirSync(path)) {
      collectOffenders(join(path, child), ctx);
    }
    return;
  }
  if (!stat.isFile()) return;
  if (!ctx.scannedExtensions.has(path.slice(path.lastIndexOf('.')))) return;
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (ctx.pattern.test(line)) {
      ctx.offenders.push(`${relativePath}:${index + 1}`);
    }
  });
}
