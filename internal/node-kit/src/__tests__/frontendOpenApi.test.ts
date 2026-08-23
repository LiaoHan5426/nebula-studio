import { describe, expect, it } from 'vitest';

import { ensureFrontendApplicationOpenApi } from '../frontendOpenApi.mjs';

describe('ensureFrontendApplicationOpenApi', () => {
  it('adds runtime path and view schema to an empty spec', () => {
    const spec = ensureFrontendApplicationOpenApi({});
    expect(spec.paths['/api/system/frontend-apps/runtime']).toBeTruthy();
    expect(spec.components.schemas.FrontendRuntimeEntryView).toBeTruthy();
    expect(
      spec.paths['/api/system/frontend-apps/runtime'].get.operationId,
    ).toBe('listFrontendRuntime');
  });

  it('overlays frontend-apps paths onto an existing spec', () => {
    const spec = ensureFrontendApplicationOpenApi({
      paths: { '/api/system/apps': { get: { operationId: 'keep' } } },
      components: { schemas: { ShellApp: { type: 'object' } } },
    });
    expect(spec.paths['/api/system/apps'].get.operationId).toBe('keep');
    expect(spec.components.schemas.ShellApp).toEqual({ type: 'object' });
    expect(spec.components.schemas.FrontendApplicationView).toBeTruthy();
  });
});
