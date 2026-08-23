import type { MessageTree, NebulaLocale } from './locale.ts';

import { createI18n } from 'vue-i18n';

import { applyDomLocale, normalizeNebulaLocale } from './locale.ts';

export type { MessageTree, NebulaLocale } from './locale.ts';
export {
  applyDomLocale,
  collectLeafKeys,
  diffMessageKeys,
  LOCALE_STORAGE_KEY,
  normalizeNebulaLocale,
  readStoredLocale,
  writeStoredLocale,
} from './locale.ts';

export type NebulaI18nInstance = ReturnType<typeof createI18n>;

export interface CreateNebulaI18nOptions {
  appId: string;
  loadMessages?: (locale: NebulaLocale) => MessageTree | Promise<MessageTree>;
  locale?: NebulaLocale;
  messages?: Partial<Record<NebulaLocale, MessageTree>>;
}

export interface NebulaI18nHandle {
  dispose(): void;
  getMissingKeys(): string[];
  i18n: NebulaI18nInstance;
  setLocale(locale: string): Promise<NebulaLocale>;
}

export interface LocaleSubscribeSource {
  locale: string;
  subscribe?(listener: (locale: string) => void): () => void;
}

function asComposerLocale(
  i18n: NebulaI18nInstance,
): string | { value: string } {
  return i18n.global.locale as string | { value: string };
}

function setComposerLocale(
  i18n: NebulaI18nInstance,
  locale: NebulaLocale,
): void {
  const current = asComposerLocale(i18n);
  if (typeof current === 'string') {
    (i18n.global as { locale: string }).locale = locale;
    return;
  }
  current.value = locale;
}

export function createNebulaI18n(
  options: CreateNebulaI18nOptions,
): NebulaI18nHandle {
  const initial = normalizeNebulaLocale(options.locale);
  const missingKeys = new Set<string>();
  const i18n = createI18n({
    legacy: false,
    locale: initial,
    fallbackLocale: 'zh-CN',
    missingWarn: false,
    fallbackWarn: false,
    missing(_locale, key) {
      missingKeys.add(String(key));
      return key;
    },
    messages: {
      'zh-CN': options.messages?.['zh-CN'] ?? {},
      'en-US': options.messages?.['en-US'] ?? {},
    },
  });

  async function setLocale(next: string): Promise<NebulaLocale> {
    const locale = normalizeNebulaLocale(next);
    const loaded = await options.loadMessages?.(locale);
    if (loaded) {
      i18n.global.setLocaleMessage(locale, loaded);
    }
    setComposerLocale(i18n as NebulaI18nInstance, locale);
    return locale;
  }

  return {
    i18n: i18n as NebulaI18nInstance,
    setLocale,
    getMissingKeys() {
      return [...missingKeys].toSorted((left, right) =>
        left.localeCompare(right),
      );
    },
    dispose() {
      missingKeys.clear();
    },
  };
}

export function bindI18nToHostLocale(
  handle: NebulaI18nHandle,
  source: LocaleSubscribeSource | undefined,
  onApplied?: (locale: NebulaLocale) => void,
): () => void {
  const apply = (raw: string) => {
    void handle.setLocale(raw).then((locale) => {
      applyDomLocale(locale);
      onApplied?.(locale);
    });
  };
  if (!source?.subscribe) {
    apply(source?.locale ?? 'zh-CN');
    return () => undefined;
  }
  return source.subscribe(apply);
}

export async function bootNebulaI18n(
  options: CreateNebulaI18nOptions,
): Promise<NebulaI18nHandle> {
  const handle = createNebulaI18n(options);
  await handle.setLocale(options.locale ?? 'zh-CN');
  return handle;
}
