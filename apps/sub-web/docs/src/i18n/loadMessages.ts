import type { MessageTree, NebulaLocale } from '@nebula-studio/i18n';

export async function loadDocsMessages(
  locale: NebulaLocale,
): Promise<MessageTree> {
  if (locale === 'en-US') {
    return (await import('./en-US.ts')).default;
  }
  return (await import('./zh-CN.ts')).default;
}
