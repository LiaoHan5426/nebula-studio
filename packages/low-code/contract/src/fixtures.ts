import type { LowCodeRuntimeSnapshot } from './types.ts';

import { LOW_CODE_SCHEMA_VERSION } from './types.ts';

export const DEMO_BOARD_APPLICATION_ID = 'demo-board';
export const DEMO_BOARD_VERSION = '1';

export function createDemoBoardSnapshot(): LowCodeRuntimeSnapshot {
  return {
    definition: {
      schemaVersion: LOW_CODE_SCHEMA_VERSION,
      applicationId: DEMO_BOARD_APPLICATION_ID,
      definitionId: 'demo-board-def',
      version: DEMO_BOARD_VERSION,
      tree: {
        id: 'root',
        type: 'Box',
        componentVersion: '1.0.0',
        props: { padding: '12px' },
        children: [
          {
            id: 'title',
            type: 'Text',
            componentVersion: '1.0.0',
            bindings: { text: { kind: 'path', path: 'title' } },
          },
          {
            id: 'orders',
            type: 'MetricCard',
            componentVersion: '1.0.0',
            props: { label: '订单' },
            bindings: {
              value: { kind: 'expr', expression: 'metrics.orders + 1' },
            },
          },
        ],
      },
    },
    componentLock: {
      components: {
        Box: '1.0.0',
        Text: '1.0.0',
        MetricCard: '1.0.0',
      },
    },
    resources: [{ id: 'demo-theme', kind: 'theme' }],
  };
}
