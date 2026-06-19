import { describe, expect, it } from 'vitest';

import { isSameDagTopology } from './dagDefinitionCompare';

describe('isSameDagTopology', () => {
  it('treats name/config-only changes as same topology', () => {
    const before = {
      nodes: {
        a: {
          type: 'INTERFACE',
          name: '原子服务调用',
          config: {},
          downstream: ['b'],
        },
        b: {
          type: 'INTERFACE',
          name: '原子服务调用',
          config: {},
          downstream: [],
        },
      },
    };
    const after = {
      nodes: {
        a: {
          type: 'INTERFACE',
          name: 'Query Orders',
          config: { interfaceId: 'intf-1' },
          downstream: ['b'],
        },
        b: {
          type: 'INTERFACE',
          name: 'Query Orders',
          config: { interfaceId: 'intf-1' },
          downstream: [],
        },
      },
    };

    expect(isSameDagTopology(before, after)).toBe(true);
  });

  it('detects edge topology changes', () => {
    const before = {
      nodes: {
        a: { type: 'INTERFACE', name: 'A', downstream: ['b'] },
        b: { type: 'INTERFACE', name: 'B', downstream: [] },
      },
    };
    const after = {
      nodes: {
        a: { type: 'INTERFACE', name: 'A', downstream: [] },
        b: { type: 'INTERFACE', name: 'B', downstream: [] },
      },
    };

    expect(isSameDagTopology(before, after)).toBe(false);
  });
});
