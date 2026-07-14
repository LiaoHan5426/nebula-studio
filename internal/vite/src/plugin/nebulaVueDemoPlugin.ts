import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';

const DEMO_QUERY = '?demo';
const DEMO_SUFFIX = '.vue?demo';
const VIRTUAL_PREFIX = '\0nebula-vue-demo:';
const VIRTUAL_SUFFIX = '\0';

/**
 * Vue SFC demo loader: `import demo from './Foo.vue?demo'` → `{ component, source }`.
 */
export function nebulaVueDemoPlugin(): Plugin {
  return {
    name: 'nebula-vue-demo',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!source.endsWith(DEMO_QUERY) || !source.includes('.vue')) {
        return null;
      }
      const vuePath = source.slice(0, -DEMO_QUERY.length);
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
      if (!id.startsWith(VIRTUAL_PREFIX) || !id.endsWith(VIRTUAL_SUFFIX)) {
        return null;
      }
      const vueId = id.slice(
        VIRTUAL_PREFIX.length,
        id.length - VIRTUAL_SUFFIX.length,
      );
      const source = readFileSync(vueId, 'utf-8');
      return [
        `import Component from ${JSON.stringify(vueId)};`,
        `const source = ${JSON.stringify(source)};`,
        `const demo = { component: Component, source };`,
        `export default demo;`,
        `export { Component as component, source };`,
      ].join('\n');
    },
  };
}

export { DEMO_QUERY, DEMO_SUFFIX };
