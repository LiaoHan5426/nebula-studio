import { describe, expect, it } from 'vitest';

import { resolveNodeDisplayLabel } from '../resolveNodeDisplayLabel';

describe('resolveNodeDisplayLabel', () => {
  it('uses selected atomic service name for INTERFACE nodes', () => {
    const label = resolveNodeDisplayLabel(
      'INTERFACE',
      { interfaceId: 'intf-1' },
      {
        INTERFACE: {
          label: '原子服务调用',
          fields: [
            {
              key: 'interfaceId',
              label: '原子服务',
              type: 'select',
              options: [{ label: 'Query Orders', value: 'intf-1' }],
            },
          ],
        },
      },
    );

    expect(label).toBe('Query Orders');
  });

  it('falls back to schema label when interface is not selected', () => {
    const label = resolveNodeDisplayLabel(
      'INTERFACE',
      {},
      {
        INTERFACE: { label: '原子服务调用', fields: [] },
      },
    );

    expect(label).toBe('原子服务调用');
  });
});
