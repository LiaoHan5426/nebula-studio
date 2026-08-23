import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

export const LOW_CODE_OFFLINE_LOCKFILE = 'low-code-lockfile.json';

export interface LowCodeOfflineLockfile {
  componentLock: { components: Record<string, string> };
  published: { applicationId: string; version: string };
  remotes: Record<
    string,
    {
      cas: Record<string, string>;
      dist: null | string;
      expose: string;
      remoteName: string;
    }
  >;
  schemaVersion: 'low-code.offline-lockfile.v1';
}

export function hashDirectoryFiles(
  root: null | string,
): Record<string, string> {
  if (!root || !existsSync(root)) {
    return {};
  }
  const files: Record<string, string> = {};
  const walk = (dir: string, prefix: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const rel = prefix ? `${prefix}/${name}` : name;
      if (statSync(full).isDirectory()) {
        walk(full, rel);
        continue;
      }
      files[rel.replaceAll('\\', '/')] = createHash('sha256')
        .update(readFileSync(full))
        .digest('hex');
    }
  };
  walk(root, '');
  return files;
}

export function buildLowCodeOfflineLockfile(
  roots: Record<string, string>,
): LowCodeOfflineLockfile {
  const dist = roots['low-code-studio'] ?? null;
  return {
    schemaVersion: 'low-code.offline-lockfile.v1',
    remotes: {
      'low-code-studio': {
        dist,
        cas: hashDirectoryFiles(dist),
        expose: './runtime-application',
        remoteName: 'nebula_low_code_studio',
      },
    },
    published: { applicationId: 'demo-board', version: '1' },
    componentLock: {
      components: {
        Box: '1.0.0',
        MetricCard: '1.0.0',
        SandboxFrame: '1.0.0',
        Text: '1.0.0',
      },
    },
  };
}

export function persistLowCodeOfflineLockfile(
  userDataDir: string,
  roots: Record<string, string>,
): string {
  mkdirSync(userDataDir, { recursive: true });
  const file = join(userDataDir, LOW_CODE_OFFLINE_LOCKFILE);
  writeFileSync(
    file,
    `${JSON.stringify(buildLowCodeOfflineLockfile(roots), null, 2)}\n`,
    'utf8',
  );
  return file;
}
