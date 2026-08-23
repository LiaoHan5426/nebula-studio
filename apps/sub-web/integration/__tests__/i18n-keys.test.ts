import { diffMessageKeys } from '@nebula-studio/i18n';

import { describe, expect, it } from 'vitest';

import enUS from '../src/i18n/en-US.ts';
import zhCN from '../src/i18n/zh-CN.ts';

describe('integration locale catalogs', () => {
  it('keeps zh-CN and en-US leaf keys in parity', () => {
    expect(diffMessageKeys(zhCN, enUS)).toEqual({
      missingInLeft: [],
      missingInRight: [],
    });
  });
});
