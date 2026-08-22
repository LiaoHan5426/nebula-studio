import { describe, expect, it } from 'vitest';

import {
  alignLoopbackIframeSrc,
  isIframeSrcAllowed,
  withHostFrameSrcPolicy,
} from '../hostCsp.ts';

describe('host iframe CSP helpers', () => {
  it('rewrites loopback iframe ports to the Host page port', () => {
    expect(
      alignLoopbackIframeSrc(
        'http://127.0.0.1:5173/iframe-guest.html',
        'http://localhost:5175',
      ),
    ).toBe('http://127.0.0.1:5175/iframe-guest.html');
  });

  it('never treats * as an allowed iframe origin', () => {
    expect(
      isIframeSrcAllowed(
        'http://127.0.0.1:5173/iframe-guest.html',
        ['*'],
        'http://localhost:5173',
      ),
    ).toBe(false);
  });

  it('allows same-origin iframe src when the allowlist is empty', () => {
    expect(
      isIframeSrcAllowed(
        'http://localhost:5173/iframe-guest.html',
        [],
        'http://localhost:5173',
      ),
    ).toBe(true);
    expect(
      isIframeSrcAllowed(
        'http://127.0.0.1:5173/iframe-guest.html',
        [],
        'http://localhost:5173',
      ),
    ).toBe(false);
  });

  it('keeps frame-src self plus loopback hosts', () => {
    expect(
      withHostFrameSrcPolicy("default-src 'self'; frame-src 'self'"),
    ).toContain("frame-src 'self' http://localhost:* http://127.0.0.1:*");
  });
});
