import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { downloadArtifact } = require('@electron/get');

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const electronDir = path.resolve(scriptDir, '../node_modules/electron');
const { version } = require(path.join(electronDir, 'package.json'));

function getPlatformPath() {
  switch (process.env.ELECTRON_INSTALL_PLATFORM || os.platform()) {
    case 'mas':
    case 'darwin':
      return 'Electron.app/Contents/MacOS/Electron';
    case 'win32':
      return 'electron.exe';
    default:
      return 'electron';
  }
}

function isInstalled() {
  const platformPath = getPlatformPath();
  try {
    const distVersion = fs
      .readFileSync(path.join(electronDir, 'dist', 'version'), 'utf8')
      .replace(/^v/, '');
    if (distVersion !== version) return false;
    if (
      fs.readFileSync(path.join(electronDir, 'path.txt'), 'utf8') !==
      platformPath
    ) {
      return false;
    }
    return fs.existsSync(path.join(electronDir, 'dist', platformPath));
  } catch {
    return false;
  }
}

async function extractZip(zipPath, distPath) {
  fs.rmSync(distPath, { recursive: true, force: true });
  fs.mkdirSync(distPath, { recursive: true });

  if (process.platform === 'win32') {
    const quotedZip = zipPath.replace(/'/g, "''");
    const quotedDist = distPath.replace(/'/g, "''");
    const result = spawnSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        `Expand-Archive -LiteralPath '${quotedZip}' -DestinationPath '${quotedDist}' -Force`,
      ],
      { stdio: 'inherit' },
    );
    if (result.status !== 0) {
      throw new Error(
        `Expand-Archive failed with exit code ${result.status ?? 'unknown'}`,
      );
    }
    return;
  }

  const extract = require('extract-zip');
  await extract(zipPath, { dir: distPath });
}

async function main() {
  if (isInstalled()) {
    return;
  }

  const zip = await downloadArtifact({
    version,
    artifactName: 'electron',
    platform: process.env.ELECTRON_INSTALL_PLATFORM || os.platform(),
    arch: process.env.ELECTRON_INSTALL_ARCH || os.arch(),
    force: process.env.force_no_cache === 'true',
  });

  await extractZip(zip, path.join(electronDir, 'dist'));
  await fs.promises.writeFile(
    path.join(electronDir, 'path.txt'),
    getPlatformPath(),
  );
}

main().catch((error) => {
  console.error(error);
  throw error;
});
