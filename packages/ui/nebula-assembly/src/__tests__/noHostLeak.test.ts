import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const srcRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const forbiddenPatterns = [
  /\bwindow\.electron\b/,
  /\bwindow\.api\b/,
  /\bpreload\b/,
  /window\.parent\s*!==\s*window/,
];

function collectSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === '__tests__') continue;
      files.push(...collectSourceFiles(fullPath));
      continue;
    }
    if (/\.(ts|vue)$/.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('nebula-assembly host leak guard', () => {
  it('does not reference electron/preload globals in package source', () => {
    const violations: string[] = [];
    for (const file of collectSourceFiles(srcRoot)) {
      const content = readFileSync(file, 'utf8');
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(content)) {
          violations.push(`${file}: ${pattern}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
