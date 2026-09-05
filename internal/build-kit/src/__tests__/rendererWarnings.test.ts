import { describe, expect, it, vi } from 'vitest';

import {
  handleNebulaRendererLog,
  NEBULA_RENDERER_CHUNK_SIZE_WARNING_LIMIT_KB,
  nebulaRendererRolldownOptions,
} from '../config/nebulaRendererWarnings';

describe('handleNebulaRendererLog', () => {
  it('ignores invalid third-party pure annotations', () => {
    const defaultHandler = vi.fn();

    handleNebulaRendererLog(
      'warn',
      { code: 'INVALID_ANNOTATION', message: 'ignored' },
      defaultHandler,
    );

    expect(defaultHandler).not.toHaveBeenCalled();
  });

  it('forwards other warnings', () => {
    const log = { code: 'OTHER_WARNING', message: 'forwarded' };
    const defaultHandler = vi.fn();

    handleNebulaRendererLog('warn', log, defaultHandler);

    expect(defaultHandler).toHaveBeenCalledWith('warn', log);
  });
});

describe('nebulaRendererRolldownOptions', () => {
  it('disables pluginTimings for Module Federation renderer builds', () => {
    expect(nebulaRendererRolldownOptions.checks?.pluginTimings).toBe(false);
  });

  it('raises the reporter limit for Vue / icon / Shiki chunks', () => {
    expect(NEBULA_RENDERER_CHUNK_SIZE_WARNING_LIMIT_KB).toBe(2048);
  });
});
