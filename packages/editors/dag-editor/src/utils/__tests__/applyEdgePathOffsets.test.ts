import { describe, expect, it } from 'vitest';

import { applyEdgePathOffsets } from '../applyEdgePathOffsets';

describe('applyEdgePathOffsets', () => {
  it('assigns opposite offsets to fork siblings', () => {
    const positions = new Map([
      ['bottom', { x: 200, y: 140 }],
      ['start', { x: 0, y: 100 }],
      ['top', { x: 200, y: 60 }],
    ]);
    const edges = applyEdgePathOffsets(
      [
        { id: 'a', source: 'start', target: 'top' },
        { id: 'b', source: 'start', target: 'bottom' },
      ],
      positions,
      { spread: 20 },
    );

    const top = edges.find((edge) => edge.target === 'top');
    const bottom = edges.find((edge) => edge.target === 'bottom');
    expect(top?.pathOptions.offset).toBe(-10);
    expect(bottom?.pathOptions.offset).toBe(10);
  });
});
