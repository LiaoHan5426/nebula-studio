import { describe, expect, it } from 'vitest';

import {
  bindI18nToHostLocale,
  collectLeafKeys,
  createNebulaI18n,
  diffMessageKeys,
  LOCALE_STORAGE_KEY,
  normalizeNebulaLocale,
  readStoredLocale,
  writeStoredLocale,
} from '../index';

describe('createNebulaI18n', () => {
  it('defaults to zh-CN with empty message catalogs', () => {
    const { i18n } = createNebulaI18n({ appId: 'settings' });
    const locale = i18n.global.locale as string | { value?: string };
    expect(typeof locale === 'string' ? locale : locale.value).toBe('zh-CN');
  });

  it('lazy-loads locale chunks and falls back to zh-CN', async () => {
    const handle = createNebulaI18n({
      appId: 'docs',
      loadMessages: async (locale) => {
        if (locale === 'en-US') {
          return { shell: { title: 'Docs' } };
        }
        return { shell: { title: '文档' } };
      },
    });
    await handle.setLocale('en-US');
    expect(handle.i18n.global.t('shell.title')).toBe('Docs');
    await handle.setLocale('fr-FR');
    expect(handle.i18n.global.t('shell.title')).toBe('文档');
  });

  it('collects missing keys for CI', () => {
    const handle = createNebulaI18n({
      appId: 'docs',
      messages: { 'zh-CN': { a: 'A' } },
    });
    handle.i18n.global.t('missing.path');
    expect(handle.getMissingKeys()).toContain('missing.path');
  });
});

describe('message key parity', () => {
  it('diffs leaf keys between catalogs', () => {
    const zh = { common: { save: '保存', cancel: '取消' } };
    const en = { common: { save: 'Save' } };
    expect(diffMessageKeys(zh, en)).toEqual({
      missingInLeft: [],
      missingInRight: ['common.cancel'],
    });
    expect(collectLeafKeys(zh)).toEqual(['common.cancel', 'common.save']);
  });
});

describe('normalizeNebulaLocale', () => {
  it('maps unknown values to zh-CN', () => {
    expect(normalizeNebulaLocale('en')).toBe('en-US');
    expect(normalizeNebulaLocale('ja')).toBe('zh-CN');
  });
});

describe('locale storage', () => {
  it('reads and writes only nebula.locale.v1', () => {
    const store: Record<string, string> = {};
    const backend = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
    } as Storage;
    writeStoredLocale(backend, 'en-US');
    expect(backend.getItem(LOCALE_STORAGE_KEY)).toBe('en-US');
    expect(backend.getItem('nebula-studio-web-locale')).toBeNull();
    expect(readStoredLocale(backend)).toBe('en-US');
  });
});

describe('bindI18nToHostLocale', () => {
  it('updates locale without recreating the instance', async () => {
    const handle = createNebulaI18n({
      appId: 'settings',
      loadMessages: async (locale) => ({
        hello: locale === 'en-US' ? 'Hello' : '你好',
      }),
    });
    const listeners = new Set<(locale: string) => void>();
    bindI18nToHostLocale(handle, {
      locale: 'zh-CN',
      subscribe(listener) {
        listeners.add(listener);
        listener('zh-CN');
        return () => {
          listeners.delete(listener);
        };
      },
    });
    await handle.setLocale('zh-CN');
    for (const listener of listeners) {
      listener('en-US');
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(handle.i18n.global.t('hello')).toBe('Hello');
  });
});
