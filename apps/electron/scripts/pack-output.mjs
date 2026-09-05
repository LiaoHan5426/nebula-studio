import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const electronRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Pack outside the repo. Cursor / Defender / leftover `dist/win-unpacked`
 * keep locking files under apps/electron/dist (EPERM on default_app.asar).
 * Override with NEBULA_ELECTRON_BUILDER_OUTPUT.
 */
export function resolveElectronBuilderOutputDir() {
  const override = process.env.NEBULA_ELECTRON_BUILDER_OUTPUT;
  if (override) {
    return override;
  }
  if (process.platform === 'win32') {
    const base =
      process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local');
    return join(base, 'NebulaStudio', 'electron-builder');
  }
  return join(electronRoot, 'dist', 'desktop');
}

export function stopPackagedApp() {
  if (process.platform !== 'win32') {
    return;
  }
  try {
    execFileSync('taskkill', ['/F', '/T', '/IM', 'nebula-studio.exe'], {
      stdio: 'ignore',
    });
  } catch {
    // Not running.
  }
}

export function removeDirQuiet(path) {
  if (!existsSync(path)) {
    return;
  }
  try {
    rmSync(path, {
      recursive: true,
      force: true,
      maxRetries: 8,
      retryDelay: 150,
    });
  } catch {
    // Locked leftover; next pack uses a writable output dir.
  }
}

export function prepareElectronBuilderOutput() {
  stopPackagedApp();
  const outputDir = resolveElectronBuilderOutputDir();
  mkdirSync(outputDir, { recursive: true });
  removeDirQuiet(join(outputDir, 'win-unpacked'));
  removeDirQuiet(join(outputDir, 'win-unpacked.tmp'));
  return outputDir;
}
