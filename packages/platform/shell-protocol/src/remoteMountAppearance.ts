export interface RemoteMountAppearance {
  cssNamespace: string;
  locale?: string;
  scheme?: string;
}

interface AppearanceCapabilities {
  locale?: {
    locale: string;
    subscribe?(listener: (locale: string) => void): () => void;
  };
  theme?: {
    resolved?: { scheme: 'dark' | 'light' };
    scheme: 'dark' | 'light' | 'system';
    subscribe?(listener: (theme: { scheme: 'dark' | 'light' }) => void): () => void;
  };
}

/**
 * Scope Remote CSS/theme marks to the Federation mount container only.
 * Host owns `documentElement` reset, `html.dark`, and document-level lang.
 */
export function applyRemoteMountAppearance(
  container: HTMLElement,
  appearance: RemoteMountAppearance,
): void {
  container.dataset.nebulaCss = appearance.cssNamespace;
  if (appearance.scheme === 'dark' || appearance.scheme === 'light') {
    container.dataset.nebulaTheme = appearance.scheme;
    container.classList.toggle('dark', appearance.scheme === 'dark');
  }
  if (appearance.locale) {
    container.dataset.nebulaLocale = appearance.locale;
  }
}

export function clearRemoteMountAppearance(container: HTMLElement): void {
  delete container.dataset.nebulaCss;
  delete container.dataset.nebulaTheme;
  delete container.dataset.nebulaLocale;
  container.classList.remove('dark');
}

/** Keep a Federation mount container synchronized with Host-owned appearance. */
export function subscribeRemoteMountAppearance(
  container: HTMLElement,
  cssNamespace: string,
  capabilities: AppearanceCapabilities,
): () => void {
  const apply = (scheme?: string, locale?: string) => {
    applyRemoteMountAppearance(container, { cssNamespace, scheme, locale });
  };
  const currentScheme = capabilities.theme?.resolved?.scheme ?? capabilities.theme?.scheme;
  apply(currentScheme, capabilities.locale?.locale);

  const disposers: Array<() => void> = [];
  const stopTheme = capabilities.theme?.subscribe?.((theme) => {
    apply(theme.scheme, capabilities.locale?.locale);
  });
  if (stopTheme) disposers.push(stopTheme);
  const stopLocale = capabilities.locale?.subscribe?.((locale) => {
    const scheme = capabilities.theme?.resolved?.scheme ?? capabilities.theme?.scheme;
    apply(scheme, locale);
  });
  if (stopLocale) disposers.push(stopLocale);

  return () => {
    for (const dispose of disposers.splice(0)) dispose();
  };
}
