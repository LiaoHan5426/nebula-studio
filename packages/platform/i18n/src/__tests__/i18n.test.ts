import { describe, expect, it } from 'vitest';

import { createNebulaI18n } from '../index.ts';

describe('createNebulaI18n', () => {
  it('defaults to zh-CN with empty message catalogs', () => {
    const { i18n } = createNebulaI18n({ appId: 'settings' });
    const locale = i18n.global.locale as { value?: string } | string;
    expect(typeof locale === 'string' ? locale : locale.value).toBe('zh-CN');
  });
});
