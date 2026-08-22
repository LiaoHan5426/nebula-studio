import type { Plugin } from 'postcss';

import postcss from 'postcss';

/** Document roots must bind to the mount container, not leak onto Host html. */
function retargetSelector(item: string, attr: string): string {
  const selector = item.trim();
  if (!selector || selector.startsWith(attr)) {
    return selector;
  }
  const documentRoot = /^(html|:root|body|#app)(.*)$/.exec(selector);
  if (documentRoot) {
    return `${attr}${documentRoot[2] ?? ''}`;
  }
  return `${attr} ${selector}`;
}

export function createCssNamespacePostcssPlugin(namespace: string): Plugin {
  const attr = `[data-nebula-css="${namespace}"]`;
  return {
    postcssPlugin: 'nebula-css-namespace',
    Once(root) {
      const renamedKeyframes = new Map<string, string>();
      root.walkAtRules(/keyframes$/i, (atRule) => {
        const name = atRule.params.trim();
        if (!name || name.endsWith(`-${namespace}`)) {
          return;
        }
        const next = `${name}-${namespace}`;
        renamedKeyframes.set(name, next);
        atRule.params = next;
      });

      root.walkRules((rule) => {
        if (rule.parent?.type === 'atrule') {
          const parentName = 'name' in rule.parent ? rule.parent.name : '';
          if (/keyframes$/i.test(parentName)) {
            return;
          }
        }
        rule.selectors = rule.selectors.map((selector) =>
          retargetSelector(selector, attr),
        );
      });

      if (renamedKeyframes.size === 0) {
        return;
      }
      root.walkDecls((decl) => {
        if (decl.prop !== 'animation' && decl.prop !== 'animation-name') {
          return;
        }
        for (const [from, to] of renamedKeyframes) {
          decl.value = decl.value.replace(
            new RegExp(`(?:^|[\\s,])${from}(?=$|[\\s,;])`, 'g'),
            (match) => match.replace(from, to),
          );
        }
      });
    },
  };
}

createCssNamespacePostcssPlugin.postcss = true;

/**
 * Scope compiled CSS (including Tailwind @layer output) to a mount attribute.
 * Must run after Tailwind emits utilities — never rewrite Tailwind source.
 */
export function applyCssNamespace(css: string, namespace: string): string {
  return postcss([createCssNamespacePostcssPlugin(namespace)]).process(css, {
    from: undefined,
  }).css;
}
