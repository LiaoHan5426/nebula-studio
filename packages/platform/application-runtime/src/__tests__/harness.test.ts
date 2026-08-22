import { describe, expect, it } from 'vitest';

import { CONTRACT_VERSION } from '@nebula-studio/application-contract';
import type { NebulaRemoteApplication } from '@nebula-studio/application-contract';
import { createPocHostCapabilities } from '@nebula-studio/host-capabilities';

import {
  asNebulaRemoteApplication,
  runRemoteContractHarness,
} from '../index.ts';

function createHarnessRemote(): NebulaRemoteApplication {
  return {
    contractVersion: CONTRACT_VERSION,
    async mount(options) {
      options.container.textContent = 'mounted';
      return {
        navigate() {},
        unmount() {
          options.container.replaceChildren();
        },
      };
    },
  };
}

describe('asNebulaRemoteApplication', () => {
  it('accepts default export', () => {
    const remote = createHarnessRemote();
    expect(asNebulaRemoteApplication({ default: remote })).toBe(remote);
  });

  it('rejects a missing mount', () => {
    expect(() =>
      asNebulaRemoteApplication({ contractVersion: CONTRACT_VERSION }),
    ).toThrow(/invalid NebulaRemoteApplication/);
  });
});

describe('resolveRemoteManifestEntry', () => {
  it('uses http in ordinary browsers', async () => {
    const { resolveRemoteManifestEntry } = await import('../index.ts');
    expect(
      resolveRemoteManifestEntry({
        httpEntry: 'http://localhost:5176/mf-manifest.json',
        packagedHost: 'docs',
      }),
    ).toBe('http://localhost:5176/mf-manifest.json');
  });
});

describe('runRemoteContractHarness', () => {
  it('mounts and unmounts a contract-compliant remote', async () => {
    await runRemoteContractHarness(
      createHarnessRemote(),
      createPocHostCapabilities(),
    );
    expect(document.body.children.length).toBe(0);
  });
});
