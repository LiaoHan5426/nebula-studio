import { describe, expect, it } from 'vitest';

import { splitImportQuery } from '../plugin/nebulaSubWebAlias.ts';

describe('splitImportQuery', () => {
  it('keeps path and query apart so ?demo is not joined into a filename', () => {
    expect(splitImportQuery('@/examples/button/ButtonBasic.vue?demo')).toEqual({
      specifier: '@/examples/button/ButtonBasic.vue',
      query: '?demo',
    });
  });

  it('leaves specifiers without query unchanged', () => {
    expect(splitImportQuery('@/components/Demo.vue')).toEqual({
      specifier: '@/components/Demo.vue',
      query: '',
    });
  });
});
