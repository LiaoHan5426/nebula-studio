import { describe, expect, it } from 'vitest';

import {
  applyOverlayStyleAttrs,
  applyStyleContract,
  clearStyleContract,
} from '../style/applyStyleContract';
import {
  STYLE_CONTRACT_ATTR,
  STYLE_DENSITY_ATTR,
  STYLE_THEME_ATTR,
} from '../types/style';

describe('applyStyleContract', () => {
  it('only mutates the provided mount root', () => {
    const root = document.createElement('div');
    const html = document.documentElement;

    applyStyleContract(root, {
      theme: 'dark',
      density: 'compact',
      namespace: 'integration',
    });

    expect(root.getAttribute(STYLE_CONTRACT_ATTR)).toBe('');
    expect(root.getAttribute(STYLE_THEME_ATTR)).toBe('dark');
    expect(root.getAttribute(STYLE_DENSITY_ATTR)).toBe('compact');

    expect(html.hasAttribute(STYLE_CONTRACT_ATTR)).toBe(false);
    expect(html.hasAttribute(STYLE_THEME_ATTR)).toBe(false);
    expect(html.hasAttribute(STYLE_DENSITY_ATTR)).toBe(false);

    clearStyleContract(root);
    expect(root.hasAttribute(STYLE_CONTRACT_ATTR)).toBe(false);
  });

  it('copies theme attrs to the overlay portal without the assembly marker', () => {
    const portal = document.createElement('div');
    applyOverlayStyleAttrs(portal, { theme: 'light', density: 'comfortable' });
    expect(portal.getAttribute(STYLE_THEME_ATTR)).toBe('light');
    expect(portal.getAttribute(STYLE_DENSITY_ATTR)).toBe('comfortable');
    expect(portal.hasAttribute(STYLE_CONTRACT_ATTR)).toBe(false);
  });
});
