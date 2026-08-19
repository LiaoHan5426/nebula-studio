import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getLayoutHostMode } from '../layoutHost';

describe('getLayoutHostMode', () => {
  const originalParent = window.parent;

  beforeEach(() => {
    delete window.__NEBULA_RUNTIME_MODE__;
  });

  afterEach(() => {
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: originalParent,
    });
    window.history.replaceState({}, '', '/');
    delete window.__NEBULA_RUNTIME_MODE__;
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

  it('maps boot-stamped platform-embed to shell-hosted without iframe', () => {
    window.__NEBULA_RUNTIME_MODE__ = 'platform-embed';
    expect(getLayoutHostMode()).toBe('shell-hosted');
  });

  it('maps boot-stamped electron to standalone even with embed query', () => {
    window.__NEBULA_RUNTIME_MODE__ = 'electron';
    window.history.replaceState({}, '', '/index.html?embed=settings');
    expect(getLayoutHostMode()).toBe('standalone');
  });

  it('keeps explicit embedSurface over injected runtime mode', () => {
    window.__NEBULA_RUNTIME_MODE__ = 'platform-embed';
    expect(getLayoutHostMode('login')).toBe('standalone');
  });
});
