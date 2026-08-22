import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join, normalize, relative, sep } from 'node:path';

import { findMonorepoRoot } from '../config/windowsManifest.ts';

const SKIP_PACKAGES = new Set([
  '@nebula-studio-internal/eslint',
  '@nebula-studio-internal/node',
  '@nebula-studio-internal/oxfmt',
  '@nebula-studio-internal/oxlint',
  '@nebula-studio-internal/stylelint',
  '@nebula-studio-internal/tailwind',
  '@nebula-studio-internal/tsconfig',
  '@nebula-studio-internal/vite',
  '@nebula-studio/msw',
  '@nebula-studio/types',
]);

export interface TailwindSourceEntry {
  packageName: string;
  /** Absolute directory Tailwind should scan. */
  absoluteDir: string;
  /** Repo-relative POSIX path for reports. */
  repoRelativeDir: string;
}

export interface TailwindSourceGraph {
  appRoot: string;
  packageName: string;
  repoRoot: string;
  sources: TailwindSourceEntry[];
}

function isWorkspaceSpec(spec: unknown): boolean {
  return typeof spec === 'string' && spec.startsWith('workspace:');
}

function posixRel(from: string, to: string): string {
  return relative(from, to).split(sep).join('/');
}

function toPosix(abs: string): string {
  return abs.split(sep).join('/');
}

function isRepoWideScanDir(dir: string, repoRoot: string): boolean {
  const n = normalize(dir);
  return (
    n === normalize(repoRoot) ||
    n === normalize(join(repoRoot, 'packages')) ||
    n === normalize(join(repoRoot, 'apps'))
  );
}

function readJson(path: string): Record<string, unknown> | null {
  if (!existsSync(path)) {
    return null;
  }
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
}

function workspacePackageNames(manifest: Record<string, unknown>): string[] {
  const names: string[] = [];
  for (const group of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
  ] as const) {
    const deps = manifest[group];
    if (!deps || typeof deps !== 'object') {
      continue;
    }
    for (const [name, spec] of Object.entries(
      deps as Record<string, unknown>,
    )) {
      if (isWorkspaceSpec(spec) && !SKIP_PACKAGES.has(name)) {
        names.push(name);
      }
    }
  }
  return names;
}

function resolveInstalledPackageDir(
  fromDir: string,
  packageName: string,
): string | null {
  let current = fromDir;
  while (true) {
    const candidate = join(current, 'node_modules', ...packageName.split('/'));
    if (existsSync(join(candidate, 'package.json'))) {
      return realpathSync(candidate);
    }
    const parent = dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

function sourceDirForPackage(packageDir: string): string | null {
  const src = join(packageDir, 'src');
  return existsSync(src) ? src : null;
}

/**
 * Tailwind `@source` directories for one Host/Remote: the app `src` plus
 * workspace packages it actually depends on. Never `packages/` or `apps/`.
 */
export function resolveTailwindSourceGraph(appRoot: string): TailwindSourceGraph {
  const repoRoot = findMonorepoRoot(appRoot);
  const manifestPath = join(appRoot, 'package.json');
  const manifest = readJson(manifestPath);
  if (!manifest) {
    throw new Error(`[nebula-tailwind] missing package.json at ${manifestPath}`);
  }
  const packageName =
    typeof manifest.name === 'string' ? manifest.name : '(unnamed)';

  const sources: TailwindSourceEntry[] = [];
  const seen = new Set<string>();
  const queue: Array<{ dir: string; name: string }> = [
    { dir: appRoot, name: packageName },
  ];

  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) {
      break;
    }
    const pkgDir = normalize(next.dir);
    if (seen.has(pkgDir)) {
      continue;
    }
    seen.add(pkgDir);

    const pkgManifest = readJson(join(pkgDir, 'package.json'));
    const srcDir = sourceDirForPackage(pkgDir);
    if (srcDir && !isRepoWideScanDir(srcDir, repoRoot)) {
      sources.push({
        packageName: next.name,
        absoluteDir: srcDir,
        repoRelativeDir: posixRel(repoRoot, srcDir),
      });
    }

    if (!pkgManifest) {
      continue;
    }
    for (const depName of workspacePackageNames(pkgManifest)) {
      const depDir = resolveInstalledPackageDir(pkgDir, depName);
      if (!depDir) {
        continue;
      }
      queue.push({ dir: depDir, name: depName });
    }
  }

  sources.sort((a, b) => a.repoRelativeDir.localeCompare(b.repoRelativeDir));
  return { appRoot, packageName, repoRoot, sources };
}

export function assertTailwindSourceGraphIsolated(graph: TailwindSourceGraph): void {
  for (const source of graph.sources) {
    if (isRepoWideScanDir(source.absoluteDir, graph.repoRoot)) {
      throw new Error(
        `[nebula-tailwind] ${graph.packageName} source is repo-wide: ${source.repoRelativeDir}`,
      );
    }
  }
}

export function formatTailwindSourceDirectives(graph: TailwindSourceGraph): string {
  return graph.sources
    .map((source) => `@source ${JSON.stringify(toPosix(source.absoluteDir))};`)
    .join('\n');
}

export function isRepoWideTailwindSourceCss(css: string): boolean {
  return /@source\s+['"][^'"]*(?:\/packages\/?['"]|\/apps\/?['"])/.test(css);
}
