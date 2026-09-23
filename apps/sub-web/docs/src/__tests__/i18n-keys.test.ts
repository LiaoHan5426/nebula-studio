import { diffMessageKeys } from '@nebula-studio/i18n';

import { describe, expect, it } from 'vite-plus/test';

import enUS from '../i18n/en-US.ts';
import zhCN from '../i18n/zh-CN.ts';

describe('docs locale catalogs', () => {
  it('keeps zh-CN and en-US leaf keys in parity', () => {
    expect(diffMessageKeys(zhCN, enUS)).toEqual({
      missingInLeft: [],
      missingInRight: [],
    });
  });
});
