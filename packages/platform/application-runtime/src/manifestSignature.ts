const ENVELOPE =
  /^nebula-sig-v1;alg=(Ed25519|ECDSA-P256-SHA256);pk=([A-Za-z0-9_-]+);sig=([A-Za-z0-9_-]+)$/;

export type ManifestSignatureAlgorithm = 'Ed25519' | 'ECDSA-P256-SHA256';

export interface ParsedManifestSignature {
  algorithm: ManifestSignatureAlgorithm;
  publicKey: string;
  signature: string;
}

export function parseManifestSignature(value: string): ParsedManifestSignature {
  const match = ENVELOPE.exec(value.trim());
  if (!match) {
    throw new Error(`unsupported manifest signature "${value}"`);
  }
  const algorithm = match[1] as ManifestSignatureAlgorithm | undefined;
  const publicKey = match[2];
  const signature = match[3];
  if (!algorithm || !publicKey || !signature) {
    throw new Error(`unsupported manifest signature "${value}"`);
  }
  return { algorithm, publicKey, signature };
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let binary = '';
  for (const byte of view) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/u, '');
}

function base64UrlToBytes(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const pad =
    padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function generateAlgorithm(
  algorithm: ManifestSignatureAlgorithm,
): AlgorithmIdentifier | EcKeyGenParams {
  if (algorithm === 'Ed25519') {
    return { name: 'Ed25519' };
  }
  return { name: 'ECDSA', namedCurve: 'P-256' };
}

async function importPublicKey(
  algorithm: ManifestSignatureAlgorithm,
  publicKey: string,
): Promise<CryptoKey> {
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.subtle) {
    throw new Error('Web Crypto is required to verify remote signatures');
  }
  return cryptoObj.subtle.importKey(
    'spki',
    base64UrlToBytes(publicKey),
    generateAlgorithm(algorithm),
    false,
    ['verify'],
  );
}

export async function verifyManifestSignature(
  bytes: ArrayBuffer,
  envelope: string,
): Promise<boolean> {
  const parsed = parseManifestSignature(envelope);
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.subtle) {
    throw new Error('Web Crypto is required to verify remote signatures');
  }
  const key = await importPublicKey(parsed.algorithm, parsed.publicKey);
  const signature = base64UrlToBytes(parsed.signature);
  if (parsed.algorithm === 'Ed25519') {
    return cryptoObj.subtle.verify({ name: 'Ed25519' }, key, signature, bytes);
  }
  return cryptoObj.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    signature,
    bytes,
  );
}

export async function signManifestBytes(
  bytes: ArrayBuffer,
  algorithm: ManifestSignatureAlgorithm = 'ECDSA-P256-SHA256',
): Promise<string> {
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.subtle) {
    throw new Error('Web Crypto is required to sign remote manifests');
  }
  const pair = (await cryptoObj.subtle.generateKey(
    generateAlgorithm(algorithm),
    true,
    ['sign', 'verify'],
  )) as CryptoKeyPair;
  const { privateKey, publicKey } = pair;
  const spki = await cryptoObj.subtle.exportKey('spki', publicKey);
  const signature =
    algorithm === 'Ed25519'
      ? await cryptoObj.subtle.sign({ name: 'Ed25519' }, privateKey, bytes)
      : await cryptoObj.subtle.sign(
          { name: 'ECDSA', hash: 'SHA-256' },
          privateKey,
          bytes,
        );
  return `nebula-sig-v1;alg=${algorithm};pk=${bytesToBase64Url(spki)};sig=${bytesToBase64Url(signature)}`;
}
