import { describe, expect, it } from 'vitest';

import {
  HOST_DEV_MF_GATEWAY_PREFIX,
  hostDevMfEntryUrl,
  shouldRewriteLoopbackManifestToHostGateway,
} from '../hostDevMf.ts';

describe('host dev MF gateway urls', () => {
  it('rewrites loopback registry entries onto the current Host origin', () => {
    expect(
      shouldRewriteLoopbackManifestToHostGateway(
        'http://localhost:5174/mf-manifest.json',
        'http://localhost:5173',
      ),
    ).toBe(true);
    expect(
      hostDevMfEntryUrl(
        'integration',
        'http://localhost:5174/mf-manifest.json',
        'http://127.0.0.1:5180',
      ),
    ).toBe(
      `http://127.0.0.1:5180${HOST_DEV_MF_GATEWAY_PREFIX}/integration/mf-manifest.json`,
    );
    expect(
      hostDevMfEntryUrl(
        'integration',
        'http://localhost:5173/__nebula-mf/integration/mf-manifest.json',
        'http://127.0.0.1:5180',
      ),
    ).toBe(
      `http://127.0.0.1:5180${HOST_DEV_MF_GATEWAY_PREFIX}/integration/mf-manifest.json`,
    );
  });

  it('keeps non-loopback published remotes on their own origin', () => {
    expect(
      shouldRewriteLoopbackManifestToHostGateway(
        'https://cdn.example/integration/mf-manifest.json',
        'https://studio.example',
      ),
    ).toBe(false);
  });
});
