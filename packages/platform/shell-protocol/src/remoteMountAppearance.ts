export interface RemoteMountAppearance {
  cssNamespace: string;
  locale?: string;
  scheme?: string;
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
