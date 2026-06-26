import { beforeEach, describe, expect, it, vi } from 'vitest';

import router from '@/router';
import { clearAuthSession, setAuthSession } from '@/shared/auth/session';

vi.mock('@/shared/composables/useShellEmbed', () => ({
  isIntegrationShellEmbed: () => false,
  isIntegrationShellIframeEmbed: () => false,
  readParentShellAuthSession: () => null,
}));

describe('router auth guard', () => {
  beforeEach(async () => {
    localStorage.clear();
    clearAuthSession();
    await router.replace('/');
    await router.isReady();
  });

  it('redirects unauthenticated users to login', async () => {
    await router.push('/dag');
    await router.isReady();
    expect(router.currentRoute.value.path).toBe('/login');
    expect(router.currentRoute.value.query.redirect).toBe('/dag');
  });

  it('allows authenticated users to open protected routes', async () => {
    setAuthSession('admin', 'x'.repeat(32), []);
    await router.push('/dag');
    await router.isReady();
    expect(router.currentRoute.value.path).toBe('/dag');
  });
});
