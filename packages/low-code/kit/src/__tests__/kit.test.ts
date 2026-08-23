import type { LowCodeDraftDocument } from '@nebula-studio/low-code-contract';

import { createDemoBoardSnapshot } from '@nebula-studio/low-code-contract';

import { describe, expect, it } from 'vitest';

import {
  applyTemplate,
  COMPONENT_API_VERSION,
  COMPONENT_MANIFESTS,
  createPaletteNode,
  TEMPLATE_MANIFESTS,
  TRUSTED_COMPONENT_LOCK,
} from '../catalog.ts';

describe('low-code kit', () => {
  it('exposes a versioned component API and trusted lock', () => {
    expect(COMPONENT_API_VERSION).toBe('low-code.component-api.v1');
    expect(COMPONENT_MANIFESTS.some((item) => item.type === 'MapControl')).toBe(
      true,
    );
    expect(TRUSTED_COMPONENT_LOCK.components.TrendChart).toBe('1.0.0');
  });

  it('creates palette nodes and applies the monitoring template', () => {
    expect(createPaletteNode('AlertList').bindings?.items).toEqual({
      kind: 'path',
      path: 'alerts',
    });
    const draft: LowCodeDraftDocument = {
      ...createDemoBoardSnapshot().definition,
      draftId: 'kit',
    };
    const next = applyTemplate(draft, 'monitoring-center');
    expect(TEMPLATE_MANIFESTS).toHaveLength(2);
    expect(next.tree.children?.some((node) => node.type === 'MapControl')).toBe(
      true,
    );
  });
});
