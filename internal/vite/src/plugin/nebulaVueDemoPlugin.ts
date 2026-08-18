import type { Plugin } from 'vite';

import { readFileSync } from 'node:fs';

const DEMO_QUERY = '?demo';
const DEMO_SUFFIX = '.vue?demo';
const VIRTUAL_PREFIX = '\0nebula-vue-demo:';
const VIRTUAL_SUFFIX = '\0';

function vuePathFromDemoSource(source: string): null | string {
  const queryIndex = source.indexOf(DEMO_QUERY);
  if (queryIndex === -1 || !source.includes('.vue')) {
    return null;
  }
  const beforeQuery = source.slice(0, queryIndex);
  const query = source.slice(queryIndex);
  if (query !== DEMO_QUERY && !query.startsWith(`${DEMO_QUERY}&`)) {
    return null;
  }
  if (!beforeQuery.endsWith('.vue')) {
    return null;
  }
  return beforeQuery;
}

function vueFileFromResolvedId(id: string): null | string {
  if (id.startsWith(VIRTUAL_PREFIX) && id.endsWith(VIRTUAL_SUFFIX)) {
    return id.slice(VIRTUAL_PREFIX.length, id.length - VIRTUAL_SUFFIX.length);
  }
  return vuePathFromDemoSource(id);
}

/**
 * Vue SFC demo loader: `import demo from './Foo.vue?demo'` → `{ component, source }`.
 */
export function nebulaVueDemoPlugin(): Plugin {
  return {
    name: 'nebula-vue-demo',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      const vuePath = vuePathFromDemoSource(source);
      if (!vuePath) {
        return null;
      }
      const resolved = await this.resolve(vuePath, importer, {
        ...options,
        skipSelf: true,
      });
      if (!resolved) {
        throw new Error(
          `[nebula-vue-demo] Cannot resolve demo component: ${source}`,
        );
      }
      const resolvedId = typeof resolved === 'string' ? resolved : resolved.id;
      // Suffix prevents @vitejs/plugin-vue from matching ids that end with `.vue`.
      return `${VIRTUAL_PREFIX}${resolvedId}${VIRTUAL_SUFFIX}`;
    },
    load(id) {
      const vueId = vueFileFromResolvedId(id);
      if (!vueId) {
        return null;
      }
      const source = readFileSync(vueId, 'utf-8');
      return [
        `import ComponentMod from ${JSON.stringify(vueId)};`,
        `const Component = ComponentMod?.default ?? ComponentMod;`,
        `const source = ${JSON.stringify(source)};`,
        `const demo = { component: Component, source };`,
        `export default demo;`,
        `export { Component as component, source };`,
      ].join('\n');
    },
  };
}

export { DEMO_QUERY, DEMO_SUFFIX };
