import { afterEach, describe, expect, it } from 'vitest';

import { getLayoutHostMode } from '../layoutHost';

describe('getLayoutHostMode', () => {
  const originalParent = window.parent;

  afterEach(() => {
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: originalParent,
    });
    window.history.replaceState({}, '', '/');
  });

  it('returns standalone without embed surface', () => {
    expect(getLayoutHostMode(null)).toBe('standalone');
  });

  it('returns standalone for login surface', () => {
    expect(getLayoutHostMode('login')).toBe('standalone');
  });

  it('returns shell-hosted for settings inside iframe', () => {
    const parent = window;
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: { ...parent, closed: false },
    });
    window.history.replaceState({}, '', '/index.html?embed=settings');
    expect(getLayoutHostMode()).toBe('shell-hosted');
  });

  it('returns standalone for settings embed param outside iframe', () => {
    window.history.replaceState({}, '', '/index.html?embed=settings');
    expect(getLayoutHostMode()).toBe('standalone');
  });
});
