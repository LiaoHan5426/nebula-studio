import { createI18n } from 'vue-i18n';

export type NebulaLocale = 'en-US' | 'zh-CN';

export function createNebulaI18n(options: {
  appId: string;
  locale?: NebulaLocale;
}): {
  dispose(): void;
  i18n: ReturnType<typeof createI18n>;
} {
  const i18n = createI18n({
    legacy: false,
    locale: options.locale ?? 'zh-CN',
    fallbackLocale: 'zh-CN',
    messages: {
      'zh-CN': {},
      'en-US': {},
    },
  });
  return {
    i18n,
    dispose() {
      /* Vue I18n has no dispose; callers unmount the app. */
    },
  };
}
