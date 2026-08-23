import { describe, expect, it } from 'vitest';

import {
  createDemoBoardSnapshot,
  LOW_CODE_THIRD_PARTY_CATALOG_ENABLED,
  lowCodePathRequiresAuth,
  migrateDefinition,
  readRuntimeSnapshotPayload,
  validateDefinition,
  validateRuntimeSnapshot,
} from '../index.ts';

describe('low-code contract', () => {
  it('validates the demo-board fixture', () => {
    const snapshot = createDemoBoardSnapshot();
    expect(validateRuntimeSnapshot(snapshot).definition.applicationId).toBe(
      'demo-board',
    );
    expect(migrateDefinition(snapshot.definition).tree.type).toBe('Box');
    expect(snapshot.definition.tree.children?.[1]?.bindings?.value).toEqual({
      kind: 'expr',
      expression: 'metrics.orders + 1',
    });
  });

  it('rejects script-bearing definitions', () => {
    expect(() =>
      validateDefinition({
        ...createDemoBoardSnapshot().definition,
        script: 'alert(1)',
      }),
    ).toThrow(/script/);
  });

  it('rejects unlocked component types', () => {
    const snapshot = createDemoBoardSnapshot();
    snapshot.componentLock.components = { Text: '1.0.0' };
    expect(() => validateRuntimeSnapshot(snapshot)).toThrow(
      /ExactComponentLock/,
    );
  });

  it('does not treat an API error envelope as a snapshot', () => {
    expect(() =>
      readRuntimeSnapshotPayload({
        code: 404,
        error: 'runtime snapshot not found',
        success: false,
      }),
    ).toThrow(/not found/);
  });

  it('requires auth on studio and catalog writes but not runtime reads', () => {
    expect(
      lowCodePathRequiresAuth('/api/low-code/runtime/demo-board/versions/1'),
    ).toBe(false);
    expect(
      lowCodePathRequiresAuth('/api/low-code/studio/demo-board/draft'),
    ).toBe(true);
    expect(lowCodePathRequiresAuth('/api/low-code/catalog/staging')).toBe(true);
    expect(lowCodePathRequiresAuth('/api/low-code/write/health')).toBe(true);
    expect(LOW_CODE_THIRD_PARTY_CATALOG_ENABLED).toBe(false);
  });
});
