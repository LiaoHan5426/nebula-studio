import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { UserConfig } from 'vite';

import {
  resolveFederationDevRemoteCacheDir,
  resolveFederationDevRemoteOrigin,
} from '@nebula-studio-internal/node-kit/runtime-config';
import { loadWindowsConfig } from '@nebula-studio-internal/node-kit/windows-manifest';

/**
 * Packages that Host and remotes commonly import. Only ids declared by the
 * app package.json (plus MF runtime) are passed to Vite.
 *
 * Keep Module Federation runtime here so the first optimizer pass already
 * contains the virtual-module graph MF injects, instead of discovering it
 * after crawl-end (Vite 8 then crashes with `browserHash` of undefined).
 */
export const NEBULA_OPTIMIZE_DEPS_CANDIDATES = [
  'vue',
  'vue-router',
  'pinia',
  'vue-i18n',
  'vuedraggable',
  '@module-federation/runtime',
  '@module-federation/runtime/helpers',
  '@iconify/vue',
  'class-variance-authority',
  'clsx',
  'nprogress',
  'reka-ui',
  'tailwind-merge',
  'vee-validate',
  'vxe-pc-ui',
  'vxe-table',
  'markdown-it',
  'shiki',
] as const;

/** Transitive packages the federation plugin injects even when not declared. */
const FEDERATION_RUNTIME_PACKAGES = new Set(['@module-federation/runtime']);

export interface CreateNebulaOptimizeDepsOptions {
  extraInclude?: readonly string[];
  /**
   * Host-composed remotes must not start a second optimizer pass. Vite 8's
   * `commitProcessing` reads `metadata.browserHash` and throws when a crawl
   * is invalidated mid-flight (typical with 4 remotes + MF DTS).
   */
  hostedRemote?: boolean;
  root: string;
}

export interface NebulaHostedRemoteEnv {
  cacheDir: string;
  origin?: string;
  port: number;
}

function packageNameOf(id: string): string {
  if (id.startsWith('@')) {
    const [scope, name] = id.split('/');
    return `${scope}/${name ?? ''}`;
  }
  return id.split('/')[0] ?? id;
}

export function resolveNebulaHostedRemoteCacheDir(port: number): string {
  return resolveFederationDevRemoteCacheDir(port);
}

export function resolveNebulaHostedRemoteEnv(
  env: NodeJS.ProcessEnv = process.env,
): NebulaHostedRemoteEnv | undefined {
  const port = Number(env.NEBULA_REMOTE_PORT);
  if (!Number.isInteger(port) || port <= 0) {
    return undefined;
  }
  const config = loadWindowsConfig();
  return {
    cacheDir: resolveFederationDevRemoteCacheDir(port, config),
    origin:
      env.NEBULA_REMOTE_ORIGIN ??
      resolveFederationDevRemoteOrigin(port, config),
    port,
  };
}

function readDeclaredPackages(root: string): Set<string> {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  return new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ]);
}

function findNearestPackageJson(fromFile: string): string | undefined {
  let current = dirname(fromFile);
  while (true) {
    const candidate = join(current, 'package.json');
    try {
      readFileSync(candidate, 'utf8');
      return candidate;
    } catch {
      // Keep walking up until the filesystem root.
    }
    const parent = dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}

function addDeclaredPackagesFromWorkspaceDependencies(
  declared: Set<string>,
  root: string,
): void {
  const require = createRequire(join(root, 'package.json'));
  for (const id of [...declared]) {
    if (!id.startsWith('@nebula-studio/')) continue;
    try {
      const entry = require.resolve(id);
      const packageJson = findNearestPackageJson(entry);
      if (!packageJson) continue;
      for (const dependency of readDeclaredPackages(dirname(packageJson))) {
        declared.add(dependency);
      }
    } catch {
      // Workspace package is not resolvable from this renderer root.
    }
  }
}

export function resolveNebulaOptimizeDepsInclude(
  root: string,
  candidates: readonly string[] = NEBULA_OPTIMIZE_DEPS_CANDIDATES,
): string[] {
  const declared = readDeclaredPackages(root);
  addDeclaredPackagesFromWorkspaceDependencies(declared, root);
  const require = createRequire(join(root, 'package.json'));
  const include: string[] = [];
  for (const id of candidates) {
    if (include.includes(id)) continue;
    const name = packageNameOf(id);
    const allowed = declared.has(name) || FEDERATION_RUNTIME_PACKAGES.has(name);
    if (!allowed) continue;
    try {
      require.resolve(id);
      include.push(id);
    } catch {
      // Declared but not installed, or a subpath that does not exist.
    }
  }
  return include;
}

export function createNebulaOptimizeDeps(
  options: CreateNebulaOptimizeDepsOptions,
): NonNullable<UserConfig['optimizeDeps']> {
  const include = [
    ...resolveNebulaOptimizeDepsInclude(options.root),
    ...(options.extraInclude ?? []),
  ];
  return {
    include,
    // MF remotes keep injecting virtual modules during crawl. Waiting until
    // crawl-end races the optimizer metadata object on Vite 8.
    holdUntilCrawlEnd: false,
    ...(options.hostedRemote ? { noDiscovery: true } : {}),
  };
}

/** Default used by generic renderer configs; callers should prefer createNebulaOptimizeDeps({ root }). */
export const nebulaRendererOptimizeDeps: UserConfig['optimizeDeps'] = {
  include: ['vuedraggable'],
  holdUntilCrawlEnd: false,
};
