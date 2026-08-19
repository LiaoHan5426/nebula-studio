import { describe, expect, it } from 'vitest';

import { renderShikiHtml } from '../shikiRender';

describe('renderShikiHtml', () => {
  it('emits dual-theme token variables for CSS-driven theme switching', async () => {
    const html = await renderShikiHtml('const ok = true', {
      lang: 'typescript',
    });
    expect(html).toContain('class="shiki');
    expect(html).toContain('--shiki-dark');
    expect(html).toContain('github-light');
    expect(html).toContain('github-dark');
  });
});
