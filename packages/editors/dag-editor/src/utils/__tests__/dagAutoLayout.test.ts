import { describe, expect, it } from 'vitest';

import { computeAutoLayout } from '../dagAutoLayout';

function requirePosition(
  id: string,
  positions: Map<string, { x: number; y: number }>,
) {
  const position = positions.get(id);
  expect(position).toBeDefined();
  return position as { x: number; y: number };
}

function y(id: string, positions: Map<string, { x: number; y: number }>) {
  return requirePosition(id, positions).y;
}

function x(id: string, positions: Map<string, { x: number; y: number }>) {
  return requirePosition(id, positions).x;
}

describe('computeAutoLayout', () => {
  it('places linear chain in one horizontal row', () => {
    const positions = computeAutoLayout(
      ['a', 'b', 'c', 'd'],
      [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
        { source: 'c', target: 'd' },
      ],
    );

    expect(x('a', positions)).toBeLessThan(x('b', positions));
    expect(x('b', positions)).toBeLessThan(x('c', positions));
    expect(x('c', positions)).toBeLessThan(x('d', positions));
    expect(y('a', positions)).toBe(y('b', positions));
    expect(y('b', positions)).toBe(y('c', positions));
    expect(y('c', positions)).toBe(y('d', positions));
  });

  it('stacks fork branches in the same column and centers the root', () => {
    const positions = computeAutoLayout(
      ['start', 'left', 'right'],
      [
        { source: 'start', target: 'left' },
        { source: 'start', target: 'right' },
      ],
    );

    expect(x('start', positions)).toBeLessThan(x('left', positions));
    expect(x('left', positions)).toBe(x('right', positions));
    expect(y('left', positions)).not.toBe(y('right', positions));
    expect(y('start', positions)).toBeCloseTo(
      (y('left', positions) + y('right', positions)) / 2,
      5,
    );
  });

  it('lays out fork-then-merge as left-to-right columns', () => {
    const positions = computeAutoLayout(
      ['start', 'branch-a', 'branch-b', 'end'],
      [
        { source: 'start', target: 'branch-a' },
        { source: 'start', target: 'branch-b' },
        { source: 'branch-a', target: 'end' },
        { source: 'branch-b', target: 'end' },
      ],
    );

    expect(x('start', positions)).toBeLessThan(x('branch-a', positions));
    expect(x('branch-a', positions)).toBe(x('branch-b', positions));
    expect(x('branch-a', positions)).toBeLessThan(x('end', positions));
  });

  it('places disconnected nodes below the main graph', () => {
    const positions = computeAutoLayout(
      ['start', 'left', 'right', 'solo'],
      [
        { source: 'start', target: 'left' },
        { source: 'start', target: 'right' },
      ],
    );

    expect(y('solo', positions)).toBeGreaterThan(y('left', positions));
    expect(y('solo', positions)).toBeGreaterThan(y('right', positions));
  });
});
