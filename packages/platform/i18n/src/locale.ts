export type NebulaLocale = 'en-US' | 'zh-CN';

export const LOCALE_STORAGE_KEY = 'nebula.locale.v1';

export type MessageTree = {
  [key: string]: MessageTree | string;
};

export function normalizeNebulaLocale(
  raw: unknown,
  fallback: NebulaLocale = 'zh-CN',
): NebulaLocale {
  if (raw === 'en-US' || raw === 'zh-CN') {
    return raw;
  }
  if (typeof raw === 'string') {
    const lower = raw.trim().toLowerCase();
    if (lower.startsWith('en')) {
      return 'en-US';
    }
    if (lower.startsWith('zh')) {
      return 'zh-CN';
    }
  }
  return fallback;
}

export function applyDomLocale(
  locale: NebulaLocale,
  root: HTMLElement | null = typeof document === 'undefined'
    ? null
    : document.documentElement,
): void {
  if (!root) {
    return;
  }
  root.lang = locale;
  root.dataset.nebulaLocale = locale;
}

export function collectLeafKeys(tree: MessageTree, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      keys.push(path);
    } else {
      keys.push(...collectLeafKeys(value, path));
    }
  }
  return keys.toSorted((left, right) => left.localeCompare(right));
}

export function diffMessageKeys(
  left: MessageTree,
  right: MessageTree,
): { missingInLeft: string[]; missingInRight: string[] } {
  const leftKeys = new Set(collectLeafKeys(left));
  const rightKeys = new Set(collectLeafKeys(right));
  return {
    missingInRight: [...leftKeys].filter((key) => !rightKeys.has(key)),
    missingInLeft: [...rightKeys].filter((key) => !leftKeys.has(key)),
  };
}

export function readStoredLocale(storage: Storage | undefined): NebulaLocale {
  if (!storage) {
    return 'zh-CN';
  }
  try {
    const current = storage.getItem(LOCALE_STORAGE_KEY);
    if (current) {
      return normalizeNebulaLocale(current);
    }
  } catch {
    /* ignore */
  }
  return 'zh-CN';
}

export function writeStoredLocale(
  storage: Storage | undefined,
  locale: NebulaLocale,
): void {
  if (!storage) {
    return;
  }
  try {
    storage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}
