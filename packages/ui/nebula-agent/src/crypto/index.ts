export type CryptoConfig = {
  algorithm?: string;
  key?: string;
  ivLength?: number;
};

export class SQLCrypto {
  private algorithm: string;
  private key: Uint8Array;
  private ivLength: number;

  constructor(config: CryptoConfig = {}) {
    this.algorithm = config.algorithm || 'AES-GCM';
    this.ivLength = config.ivLength || 12;

    if (config.key) {
      this.key = this.hexToUint8Array(config.key);
    } else {
      this.key = this.generateKey();
    }

    this.checkSubtleAvailability();
  }

  private checkSubtleAvailability(): void {
    if (typeof crypto === 'undefined' || typeof crypto.subtle === 'undefined') {
      throw new Error(
        'crypto.subtle is not available in this environment. Please use HTTPS or localhost.',
      );
    }
  }

  private generateKey(): Uint8Array {
    const array = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return array;
  }

  private hexToUint8Array(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  private uint8ArrayToHex(array: Uint8Array): string {
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  getKeyHex(): string {
    return this.uint8ArrayToHex(this.key);
  }

  setKeyHex(key: string): void {
    this.key = this.hexToUint8Array(key);
  }

  async encrypt(sql: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(sql);

    const iv = new Uint8Array(this.ivLength);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(iv);
    } else {
      for (let i = 0; i < iv.length; i++) {
        iv[i] = Math.floor(Math.random() * 256);
      }
    }

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      this.key.buffer as ArrayBuffer,
      { name: this.algorithm },
      false,
      ['encrypt'],
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: this.algorithm, iv: iv.buffer as ArrayBuffer },
      cryptoKey,
      data,
    );

    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);

    return this.uint8ArrayToHex(result);
  }

  async decrypt(encryptedHex: string): Promise<string> {
    const encrypted = this.hexToUint8Array(encryptedHex);

    const iv = encrypted.slice(0, this.ivLength);
    const data = encrypted.slice(this.ivLength);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      this.key.buffer as ArrayBuffer,
      { name: this.algorithm },
      false,
      ['decrypt'],
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: this.algorithm, iv: iv.buffer as ArrayBuffer },
      cryptoKey,
      data.buffer as ArrayBuffer,
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
}
