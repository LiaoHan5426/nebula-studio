import type { Plugin } from 'vite';

import { applyCssNamespace } from './applyCssNamespace.ts';

function isStyleModule(id: string): boolean {
  const path = id.split('?')[0] ?? id;
  return path.endsWith('.css') || path.endsWith('.scss');
}

function looksLikeJsModule(code: string): boolean {
  return /^\s*(?:import|export)\b/.test(code);
}

/**
 * Same-document Federation remotes only (hello PoC).
 * Product iframe remotes must not use this — the document is the CSS boundary.
 *
 * Runs after Tailwind (`enforce: 'post'`) so utilities, @layer, and @media are
 * prefixed via PostCSS instead of a source-level regex.
 */
export function nebulaCssNamespacePlugin(namespace: string): Plugin {
  const alreadyNamespaced = (css: string): boolean =>
    css.includes(`[data-nebula-css="${namespace}"]`) ||
    css.includes(`[data-nebula-css='${namespace}']`) ||
    css.includes(`[data-nebula-css=${namespace}]`);

  const rewrite = (css: string): string => {
    if (alreadyNamespaced(css)) {
      return css;
    }
    return applyCssNamespace(css, namespace);
  };

  return {
    name: 'nebula-css-namespace',
    enforce: 'post',
    transform(code, id) {
      if (id.includes('\0') || id.includes('node_modules')) {
        return;
      }
      if (!isStyleModule(id) || looksLikeJsModule(code)) {
        return;
      }
      return {
        code: rewrite(code),
        map: null,
      };
    },
    generateBundle(_options, bundle) {
      for (const item of Object.values(bundle)) {
        if (item.type !== 'asset' || !item.fileName.endsWith('.css')) {
          continue;
        }
        item.source = rewrite(String(item.source));
      }
    },
  };
}
