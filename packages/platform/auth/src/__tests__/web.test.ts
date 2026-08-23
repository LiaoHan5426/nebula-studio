import { describe, expect, it } from 'vitest';

import { buildWebShellLoginHref } from '../web';

describe('buildWebShellLoginHref', () => {
  it('uses /?embed=login without index.html', () => {
    const href = buildWebShellLoginHref(
      'http://localhost:5173',
      'http://localhost:5173/',
    );

    expect(href).toBe(
      'http://localhost:5173/?embed=login&return=http%3A%2F%2Flocalhost%3A5173%2F',
    );
  });

  it('strips index.html from same-origin return urls', () => {
    const href = buildWebShellLoginHref(
      'http://localhost:5173',
      'http://localhost:5173/index.html',
    );

    expect(href).toContain('return=http%3A%2F%2Flocalhost%3A5173%2F');
    expect(href).not.toContain('index.html');
  });
});
