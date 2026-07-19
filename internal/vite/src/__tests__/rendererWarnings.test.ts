import { describe, expect, it, vi } from 'vitest';
import { handleNebulaRendererWarning } from '../config/nebulaRendererWarnings';

describe('handleNebulaRendererWarning', () => {
  it('ignores invalid third-party pure annotations', () => {
    const defaultHandler = vi.fn();

    handleNebulaRendererWarning(
      { code: 'INVALID_ANNOTATION', message: 'ignored' } as never,
      defaultHandler,
    );

    expect(defaultHandler).not.toHaveBeenCalled();
  });

  it('forwards other warnings', () => {
    const warning = { code: 'OTHER_WARNING', message: 'forwarded' } as never;
    const defaultHandler = vi.fn();

    handleNebulaRendererWarning(warning, defaultHandler);

    expect(defaultHandler).toHaveBeenCalledWith(warning);
  });
});
