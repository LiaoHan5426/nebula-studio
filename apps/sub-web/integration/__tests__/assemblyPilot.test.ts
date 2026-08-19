import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

const pilotFiles = [
  'features/flows/DagOrchestrationPage.vue',
  'features/service/components/publish/ServiceDagEditorDialog.vue',
  'features/service/composables/useServicePublish.ts',
];

const forbiddenPatterns = [
  /\bwindow\.electron\b/,
  /\bwindow\.api\b/,
  /\bpreload\b/,
  /window\.parent\s*!==\s*window/,
];

describe('integration assembly pilot host leak guard', () => {
  it('pilot editor pages do not branch on host globals', () => {
    const violations: string[] = [];
    for (const relativePath of pilotFiles) {
      const content = readFileSync(join(repoRoot, relativePath), 'utf8');
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(content)) {
          violations.push(`${relativePath}: ${pattern}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
