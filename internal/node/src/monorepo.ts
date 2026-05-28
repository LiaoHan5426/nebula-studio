import type { Package } from '@manypkg/get-packages';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import {
  getPackages as getPackagesFunc,
  getPackagesSync as getPackagesSyncFunc,
} from '@manypkg/get-packages';

function isMonorepoRoot(dir: string): boolean {
  return (
    existsSync(join(dir, 'pnpm-lock.yaml')) ||
    existsSync(join(dir, 'pnpm-workspace.yaml'))
  );
}

/**
 * 自 `cwd` 向上查找 pnpm 工作区根（存在 `pnpm-lock.yaml` 或 `pnpm-workspace.yaml` 的目录）。
 */
export function findMonorepoRoot(cwd: string = process.cwd()): string {
  let currentDir = resolve(cwd);

  while (true) {
    if (isMonorepoRoot(currentDir)) {
      return currentDir;
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      return '';
    }

    currentDir = parentDir;
  }
}

function requireMonorepoRoot(cwd: string): string {
  const root = findMonorepoRoot(cwd);
  if (!root) {
    throw new Error(
      `[@nebula-studio-internal/node] Cannot find monorepo root from cwd=${cwd}`,
    );
  }
  return root;
}

/** 同步枚举工作区内全部包（含根 `package.json`）。 */
export function getPackagesSync(cwd: string = process.cwd()) {
  return getPackagesSyncFunc(requireMonorepoRoot(cwd));
}

/** 异步枚举工作区内全部包（含根 `package.json`）。 */
export async function getPackages(cwd: string = process.cwd()) {
  return getPackagesFunc(requireMonorepoRoot(cwd));
}

/** 按 `package.json` 的 `name` 查找单个包。 */
export async function getPackage(
  pkgName: string,
  cwd: string = process.cwd(),
): Promise<Package | undefined> {
  const { packages } = await getPackages(cwd);
  return packages.find((pkg: Package) => pkg.packageJson.name === pkgName);
}

/** 同步版 {@link getPackage}。 */
export function getPackageSync(
  pkgName: string,
  cwd: string = process.cwd(),
): Package | undefined {
  const { packages } = getPackagesSync(cwd);
  return packages.find((pkg) => pkg.packageJson.name === pkgName);
}

export type { Package } from '@manypkg/get-packages';
