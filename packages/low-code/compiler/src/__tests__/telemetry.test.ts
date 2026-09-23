import { describe, expect, it } from 'vite-plus/test';

import {
  getSandboxTelemetrySnapshot,
  recordSandboxCircuitOpen,
  resetSandboxTelemetry,
} from '../sandboxTelemetry.ts';

describe('sandboxTelemetry', () => {
  it('records circuit-open events for soak/熔断 inspection', () => {
    resetSandboxTelemetry();
    recordSandboxCircuitOpen('guest');
    expect(getSandboxTelemetrySnapshot()).toEqual([
      expect.objectContaining({ kind: 'circuit-open', nodeId: 'guest' }),
    ]);
  });
});
