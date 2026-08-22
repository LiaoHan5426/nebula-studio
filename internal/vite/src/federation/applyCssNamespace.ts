const KEYFRAME_BLOCK_RE = /@keyframes\s+[^{]+\{(?:[^{}]|\{[^{}]*\})*\}/g;
const PREAMBLE_AND_RULE_RE =
  /(^|})(\s*(?:\/\*[\s\S]*?\*\/\s*)*(?:@(?:import|charset|namespace)[^;]+;\s*)*)([^@{}][^{}]*?)\s*\{/g;

function splitTopLevelSelectors(selectors: string): string[] {
  const parts: string[] = [];
  let current = '';
  let paren = 0;
  let square = 0;
  for (const char of selectors) {
    if (char === '(') {
      paren += 1;
    } else if (char === ')') {
      paren = Math.max(0, paren - 1);
    } else if (char === '[') {
      square += 1;
    } else if (char === ']') {
      square = Math.max(0, square - 1);
    } else if (char === ',' && paren === 0 && square === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  if (current.length > 0) {
    parts.push(current);
  }
  return parts;
}

function prefixRuleSelectors(css: string, attr: string): string {
  return css.replace(
    PREAMBLE_AND_RULE_RE,
    (full, brace: string, preamble: string, selectors: string) => {
      const trimmed = selectors.trim();
      if (!trimmed || trimmed.startsWith('@') || trimmed.includes('@')) {
        return full;
      }
      const prefixed = splitTopLevelSelectors(trimmed)
        .map((selector) => {
          const item = selector.trim();
          if (
            !item ||
            item.startsWith(attr) ||
            item.startsWith(':root') ||
            item.startsWith('html')
          ) {
            return item;
          }
          return `${attr} ${item}`;
        })
        .join(', ');
      return `${brace}${preamble}${prefixed} {`;
    },
  );
}

export function applyCssNamespace(css: string, namespace: string): string {
  const attr = `[data-nebula-css="${namespace}"]`;
  const keyframes: string[] = [];
  const withoutKeyframes = css.replace(KEYFRAME_BLOCK_RE, (block) => {
    const rewritten = block.replace(
      /@keyframes\s+([A-Za-z_][\w-]*)/,
      (_match, name: string) =>
        name.endsWith(`-${namespace}`)
          ? `@keyframes ${name}`
          : `@keyframes ${name}-${namespace}`,
    );
    keyframes.push(rewritten);
    return `/*NEBULA_KF_${keyframes.length - 1}*/`;
  });

  let next = prefixRuleSelectors(withoutKeyframes, attr);
  next = next.replace(
    /animation(?:-name)?:\s*([A-Za-z_][\w-]*)/g,
    (full, name: string) => {
      if (name.endsWith(`-${namespace}`)) {
        return full;
      }
      return full.replace(name, `${name}-${namespace}`);
    },
  );

  return next.replace(/\/\*NEBULA_KF_(\d+)\*\//g, (_match, index: string) => {
    return keyframes[Number(index)] ?? '';
  });
}
