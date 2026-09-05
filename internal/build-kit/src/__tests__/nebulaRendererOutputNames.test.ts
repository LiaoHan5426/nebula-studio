import { describe, expect, it } from 'vitest';

import {
  nebulaRendererChunkFileNames,
  sanitizeRendererChunkName,
} from '../config/nebulaRendererOutputNames.ts';

describe('sanitizeRendererChunkName', () => {
  it('collapses Module Federation virtual share ids', () => {
    expect(
      sanitizeRendererChunkName(
        '_virtual_mf___mfe_internal__nebula_electron_host__mf_owner__1__loadShare__vue__loadShare__',
      ),
    ).toBe('mf-share');
  });

  it('truncates other long names so the Vite reporter stays single-line', () => {
    const name = 'a'.repeat(80);
    expect(sanitizeRendererChunkName(name).length).toBeLessThanOrEqual(40);
  });

  it('leaves short chunk names unchanged', () => {
    expect(sanitizeRendererChunkName('bootHostLogin')).toBe('bootHostLogin');
  });
});

describe('nebulaRendererChunkFileNames', () => {
  it('emits a hashed assets path', () => {
    expect(
      nebulaRendererChunkFileNames({
        name: '_virtual_mf___mfe_internal__x__loadShare__vue',
      }),
    ).toBe('assets/mf-share-[hash].js');
  });
});
