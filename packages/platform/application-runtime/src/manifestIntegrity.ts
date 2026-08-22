import { Buffer } from 'node:buffer';

import { verifyManifestSignature } from './manifestSignature';

const SRI_PATTERN = /^(sha256|sha384|sha512)-([A-Za-z0-9+/=]+)$/;

const WEB_CRYPTO_ALGOS = {
  sha256: 'SHA-256',
  sha384: 'SHA-384',
  sha512: 'SHA-512',
} as const;

export function parseSri(integrity: string): {
  algorithm: keyof typeof WEB_CRYPTO_ALGOS;
  hash: string;
} {
  const match = SRI_PATTERN.exec(integrity.trim());
  if (!match) {
    throw new Error(`unsupported integrity value "${integrity}"`);
  }
  const algorithm = match[1] as keyof typeof WEB_CRYPTO_ALGOS | undefined;
  const hash = match[2];
  if (!algorithm || !hash) {
    throw new Error(`unsupported integrity value "${integrity}"`);
  }
  return { algorithm, hash };
}

export function isHttpManifestUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function bytesToBase64(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  if (typeof btoa === 'function') {
    let binary = '';
    for (const byte of view) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }
  return Buffer.from(view).toString('base64');
}

export async function digestSri(
  algorithm: keyof typeof WEB_CRYPTO_ALGOS,
  bytes: ArrayBuffer,
): Promise<string> {
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.subtle) {
    throw new Error('Web Crypto is required to verify remote integrity');
  }
  const digest = await cryptoObj.subtle.digest(
    WEB_CRYPTO_ALGOS[algorithm],
    bytes,
  );
  return bytesToBase64(digest);
}

export async function matchesSri(
  bytes: ArrayBuffer,
  integrity: string,
): Promise<boolean> {
  const parsed = parseSri(integrity);
  const actual = await digestSri(parsed.algorithm, bytes);
  return actual === parsed.hash;
}

export async function assertHttpManifestIntegrity(
  entryUrl: string,
  integrity?: string,
  signature?: string,
): Promise<void> {
  const expected = integrity?.trim();
  const signed = signature?.trim();
  if (!expected && !signed) {
    return;
  }
  if (!isHttpManifestUrl(entryUrl)) {
    return;
  }
  const response = await fetch(entryUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(
      `manifest HTTP ${String(response.status)} while verifying integrity`,
    );
  }
  const body = await response.arrayBuffer();
  if (expected && !(await matchesSri(body, expected))) {
    throw new Error(`manifest integrity mismatch for ${entryUrl}`);
  }
  if (signed && !(await verifyManifestSignature(body, signed))) {
    throw new Error(`manifest signature mismatch for ${entryUrl}`);
  }
}
