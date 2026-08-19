import { describe, expect, it } from 'vitest';

import { filterCatalogItems } from '../useResourceCatalogPage';
import type { ResourceSummaryViewModel } from '../types';
import { DEFAULT_CATALOG_QUERY } from '../types';

const sampleItems: ResourceSummaryViewModel[] = [
  {
    id: 'a',
    kind: 'API',
    name: 'Alpha API',
    description: 'first',
    provider: 'team-a',
    tags: ['orders'],
    availability: 'AVAILABLE',
    updatedAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'b',
    kind: 'TABLE',
    name: 'Beta Table',
    description: 'second',
    provider: 'team-b',
    tags: ['inventory'],
    availability: 'APPROVAL_REQUIRED',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

describe('useResourceCatalogPage helpers', () => {
  it('filters catalog items by keyword and kind', () => {
    const result = filterCatalogItems(
      sampleItems,
      { ...DEFAULT_CATALOG_QUERY, keyword: 'alpha', kind: 'API' },
      [],
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('a');
  });

  it('sorts by updated date when requested', () => {
    const result = filterCatalogItems(
      sampleItems,
      { ...DEFAULT_CATALOG_QUERY, sort: 'UPDATED' },
      [],
    );
    expect(result.map((item) => item.id)).toEqual(['a', 'b']);
  });
});
