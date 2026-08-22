import { describe, expect, it } from 'vitest';

import {
  isShellEmbedNavigatePayload,
  isShellEmbedPageMetaPayload,
} from '../embedMessaging';

describe('shell embed messaging contracts', () => {
  it('accepts internal navigation paths only', () => {
    expect(
      isShellEmbedNavigatePayload({
        type: 'nebula-shell-embed-navigate',
        path: '/catalog',
      }),
    ).toBe(true);
    expect(
      isShellEmbedNavigatePayload({
        type: 'nebula-shell-embed-navigate',
        path: 'https://example.com',
      }),
    ).toBe(false);
  });

  it('validates page metadata messages', () => {
    expect(
      isShellEmbedPageMetaPayload({
        type: 'nebula-shell-embed-page-meta',
        appId: 'integration',
        path: '/catalog',
        title: '资源目录',
      }),
    ).toBe(true);
    expect(
      isShellEmbedPageMetaPayload({
        type: 'nebula-shell-embed-page-meta',
        path: '/catalog',
      }),
    ).toBe(false);
  });
});
