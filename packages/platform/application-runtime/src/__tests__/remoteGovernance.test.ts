import { describe, expect, it } from 'vitest';

import {
  digestSri,
  isHttpManifestUrl,
  matchesSri,
  parseSri,
} from '../manifestIntegrity.ts';
import {
  parseManifestSignature,
  signManifestBytes,
  verifyManifestSignature,
} from '../manifestSignature.ts';
import { packagedRemoteUpdatePolicy } from '../packagedRemoteUpdate.ts';

describe('manifest integrity', () => {
  it('parses SRI tokens', () => {
    expect(parseSri('sha384-abc+def/A==')).toEqual({
      algorithm: 'sha384',
      hash: 'abc+def/A==',
    });
    expect(isHttpManifestUrl('http://localhost:5176/mf-manifest.json')).toBe(
      true,
    );
    expect(isHttpManifestUrl('nebula-remote://docs/mf-manifest.json')).toBe(
      false,
    );
  });

  it('matches a sha256 digest', async () => {
    const bytes = new TextEncoder().encode('{"id":"docs"}').buffer;
    const hash = await digestSri('sha256', bytes);
    await expect(matchesSri(bytes, `sha256-${hash}`)).resolves.toBe(true);
    await expect(
      matchesSri(bytes, 'sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='),
    ).resolves.toBe(false);
  });
});

describe('packaged remote update policy', () => {
  it('pins extraResources on nebula-remote and file protocols', () => {
    expect(packagedRemoteUpdatePolicy('nebula-remote:')).toEqual({
      allowHttpAutoUpdate: false,
      pinToExtraResources: true,
      source: 'packaged-protocol',
    });
    expect(packagedRemoteUpdatePolicy('http:').pinToExtraResources).toBe(false);
  });
});

describe('manifest signature', () => {
  it('parses the public-key envelope', () => {
    expect(
      parseManifestSignature(
        'nebula-sig-v1;alg=ECDSA-P256-SHA256;pk=abc;sig=def',
      ),
    ).toEqual({
      algorithm: 'ECDSA-P256-SHA256',
      publicKey: 'abc',
      signature: 'def',
    });
  });

  it('round-trips an ECDSA signature over manifest bytes', async () => {
    const bytes = new TextEncoder().encode('{"id":"docs"}').buffer;
    const envelope = await signManifestBytes(bytes, 'ECDSA-P256-SHA256');
    await expect(verifyManifestSignature(bytes, envelope)).resolves.toBe(true);
    const other = new TextEncoder().encode('{"id":"tampered"}').buffer;
    await expect(verifyManifestSignature(other, envelope)).resolves.toBe(false);
  });
});
