import { describe, expect, it } from 'vitest';

import { applyCssNamespace } from '../federation/applyCssNamespace.ts';
import { nebulaCssNamespacePlugin } from '../federation/nebulaCssNamespacePlugin.ts';

function runTransform(
  plugin: { transform?: unknown },
  code: string,
  id: string,
) {
  const hook = plugin.transform;
  if (typeof hook !== 'function') {
    throw new Error('expected transform function');
  }
  return hook.call({} as never, code, id);
}

describe('applyCssNamespace', () => {
  it('scopes opposite .poc-box colors so load order cannot override the other app', () => {
    const red = applyCssNamespace(
      '.poc-box { color: rgb(220, 38, 38); animation-name: poc-pulse; }\n@keyframes poc-pulse { from { opacity: 1; } to { opacity: 0.2; } }',
      'hello',
    );
    const blue = applyCssNamespace(
      '.poc-box { color: rgb(37, 99, 235); animation-name: poc-pulse; }\n@keyframes poc-pulse { from { opacity: 0.2; } to { opacity: 1; } }',
      'hello-style-b',
    );

    expect(red).toContain('[data-nebula-css="hello"] .poc-box');
    expect(blue).toContain('[data-nebula-css="hello-style-b"] .poc-box');
    expect(red).toContain('@keyframes poc-pulse-hello');
    expect(blue).toContain('@keyframes poc-pulse-hello-style-b');
    expect(red).toMatch(/animation-name:\s*poc-pulse-hello/);
    expect(red).not.toMatch(/\[data-nebula-css="hello"\]\s*to\s*\{/);
    expect(red).not.toContain('[data-nebula-css="hello-style-b"]');
    expect(blue).not.toContain(
      '[data-nebula-css="hello"] .poc-box { color: rgb(220, 38, 38)',
    );
  });

  it('does not treat comments or @import as selectors', () => {
    const next = applyCssNamespace(
      "/* 文档页面共享样式 */\n\n@import './shiki-theme.css';\n\n.doc-section {\n  max-width: 900px;\n}\n",
      'docs',
    );
    expect(next).toContain('/* 文档页面共享样式 */');
    expect(next).toContain("@import './shiki-theme.css';");
    expect(next).toContain('[data-nebula-css="docs"] .doc-section');
    expect(next).not.toMatch(/\[data-nebula-css="docs"\][\s\S]*@import/);
  });

  it('retargets html/body/#app onto the mount namespace', () => {
    const next = applyCssNamespace(
      'html, body, #app { height: 100%; overflow: hidden; }\nhtml.dark { color-scheme: dark; }\n',
      'docs',
    );
    expect(next).toContain('[data-nebula-css="docs"]');
    expect(next).toContain('height: 100%');
    expect(next).toContain('[data-nebula-css="docs"].dark');
    expect(next).not.toMatch(/(?:^|})\s*html[\s,{]/);
    expect(next).not.toMatch(/(?:^|})\s*body[\s,{]/);
  });

  it('does not split Tailwind arbitrary values on inner commas', () => {
    const next = applyCssNamespace(
      '.max-h-[min(90vh, 40rem)] { max-height: min(90vh, 40rem); }',
      'docs',
    );
    expect(next).toContain(
      '[data-nebula-css="docs"] .max-h-[min(90vh, 40rem)]',
    );
    expect(next).not.toContain('[data-nebula-css="docs"] 40rem');
  });

  it('prefixes the first rule inside @layer utilities', () => {
    const next = applyCssNamespace(
      '@layer utilities {\n  .visible { visibility: visible; }\n  .fixed { position: fixed; }\n}\n',
      'settings',
    );
    expect(next).toContain(
      '[data-nebula-css="settings"] .visible { visibility: visible; }',
    );
    expect(next).toContain(
      '[data-nebula-css="settings"] .fixed { position: fixed; }',
    );
  });
});

describe('nebulaCssNamespacePlugin', () => {
  it('rewrites raw CSS in transform (Vite dev path)', () => {
    const plugin = nebulaCssNamespacePlugin('hello');
    const result = runTransform(
      plugin,
      '.poc-box { color: rgb(220, 38, 38); }',
      '/tmp/poc.css',
    );
    expect(result).toMatchObject({
      code: expect.stringContaining('[data-nebula-css="hello"] .poc-box'),
    });
  });

  it('does not rewrite CSS that Vite already turned into JS', () => {
    const plugin = nebulaCssNamespacePlugin('hello');
    const result = runTransform(
      plugin,
      'export default ".poc-box { color: rgb(220, 38, 38); }"',
      '/tmp/poc.css',
    );
    expect(result).toBeUndefined();
  });

  it('does not double-prefix minified unquoted attribute selectors', () => {
    const plugin = nebulaCssNamespacePlugin('hello');
    const generateBundle = plugin.generateBundle;
    if (typeof generateBundle !== 'function') {
      throw new Error('expected generateBundle function');
    }
    const bundle = {
      'a.css': {
        type: 'asset' as const,
        fileName: 'a.css',
        source: '[data-nebula-css=hello] .poc-box{color:red}',
      },
    };
    generateBundle.call({} as never, {}, bundle);
    expect(bundle['a.css'].source).toBe(
      '[data-nebula-css=hello] .poc-box{color:red}',
    );
  });
});
