import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  applyProductionScriptNonceToHtml,
  NEBULA_CSP_NONCE_PLACEHOLDER,
  withProductionScriptNonce,
} from '../plugin/hostCspNonce.ts';

describe('production Host CSP nonce', () => {
  it('drops script unsafe-inline and inserts a nonce', () => {
    expect(
      withProductionScriptNonce(
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
      ),
    ).toBe(
      `default-src 'self'; script-src 'nonce-${NEBULA_CSP_NONCE_PLACEHOLDER}' 'self' 'wasm-unsafe-eval'`,
    );
  });

  it('rewrites a multiline CSP meta without touching style-src unsafe-inline', () => {
    const html = `<meta
      http-equiv="Content-Security-Policy"
      content="script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    />`;
    expect(applyProductionScriptNonceToHtml(html)).toContain(
      "style-src 'self' 'unsafe-inline'",
    );
    expect(applyProductionScriptNonceToHtml(html)).not.toMatch(
      /script-src(?:(?!;).)*'unsafe-inline'/,
    );
  });

  it('rewrites the committed Web Host index.html CSP', () => {
    const html = readFileSync(
      join(
        dirname(fileURLToPath(import.meta.url)),
        '../../../../apps/web/index.html',
      ),
      'utf8',
    );
    const next = applyProductionScriptNonceToHtml(html);
    expect(next).toContain(`'nonce-${NEBULA_CSP_NONCE_PLACEHOLDER}'`);
    expect(next).not.toMatch(/script-src(?:(?!;).)*'unsafe-inline'/);
    expect(next).toContain("style-src 'self' 'unsafe-inline'");
  });
});
