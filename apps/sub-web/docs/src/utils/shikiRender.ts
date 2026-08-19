import type { BundledLanguage, Highlighter } from 'shiki';

import { getHighlighter } from './highlighter';

export const SHIKI_DUAL_THEMES = {
  light: 'github-light',
  dark: 'github-dark',
} as const;

export interface RenderShikiOptions {
  lang?: string;
}

/**
 * Shiki dual-theme HTML — switches with `html.dark` / `html[data-theme]` via shiki-theme.css.
 */
export async function renderShikiHtml(
  code: string,
  options: RenderShikiOptions = {},
): Promise<string> {
  const h = await getHighlighter();
  const lang = resolveLang(h, options.lang);
  try {
    return h.codeToHtml(code, {
      lang,
      themes: SHIKI_DUAL_THEMES,
    });
  } catch {
    return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
  }
}

function resolveLang(h: Highlighter, lang?: string): BundledLanguage {
  const normalized = (lang || 'text').trim().toLowerCase();
  const aliases: Record<string, BundledLanguage> = {
    ts: 'typescript',
    js: 'javascript',
    sh: 'shell',
    yml: 'yaml',
  };
  const candidate = (aliases[normalized] ?? normalized) as BundledLanguage;
  if (h.getLoadedLanguages().includes(candidate)) {
    return candidate;
  }
  return 'text';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
