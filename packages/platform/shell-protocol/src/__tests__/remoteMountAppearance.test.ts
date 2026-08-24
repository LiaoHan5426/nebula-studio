import { describe, expect, it } from 'vitest';

import {
  applyRemoteMountAppearance,
  clearRemoteMountAppearance,
  subscribeRemoteMountAppearance,
} from '../remoteMountAppearance';

describe('remoteMountAppearance', () => {
  it('scopes cssNamespace to the mount container only', () => {
    const root = document.documentElement;
    const container = document.createElement('div');
    applyRemoteMountAppearance(container, {
      cssNamespace: 'docs',
      scheme: 'dark',
      locale: 'zh-CN',
    });
    expect(container.dataset.nebulaCss).toBe('docs');
    expect(container.dataset.nebulaTheme).toBe('dark');
    expect(container.classList.contains('dark')).toBe(true);
    expect(root.dataset.nebulaCss).toBeUndefined();
    clearRemoteMountAppearance(container);
    expect(container.dataset.nebulaCss).toBeUndefined();
    expect(container.classList.contains('dark')).toBe(false);
  });

  it('tracks host theme and locale subscriptions', () => {
    const container = document.createElement('div');
    let themeListener:
      | ((theme: { scheme: 'dark' | 'light' }) => void)
      | undefined;
    let localeListener: ((locale: string) => void) | undefined;
    const stop = subscribeRemoteMountAppearance(container, 'settings', {
      theme: {
        scheme: 'light',
        subscribe(listener) {
          themeListener = listener;
          return () => {
            themeListener = undefined;
          };
        },
      },
      locale: {
        locale: 'zh-CN',
        subscribe(listener) {
          localeListener = listener;
          return () => {
            localeListener = undefined;
          };
        },
      },
    });
    expect(container.dataset.nebulaCss).toBe('settings');
    expect(container.dataset.nebulaLocale).toBe('zh-CN');
    themeListener?.({ scheme: 'dark' });
    expect(container.classList.contains('dark')).toBe(true);
    localeListener?.('en-US');
    expect(container.dataset.nebulaLocale).toBe('en-US');
    stop();
    expect(themeListener).toBeUndefined();
    expect(localeListener).toBeUndefined();
  });
});
