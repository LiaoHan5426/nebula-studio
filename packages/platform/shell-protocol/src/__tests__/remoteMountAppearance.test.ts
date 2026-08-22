import { describe, expect, it } from 'vitest';

import {
  applyRemoteMountAppearance,
  clearRemoteMountAppearance,
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
});
