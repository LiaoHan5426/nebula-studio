import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearAuthSession, setAuthSession } from '@/shared/auth/session';
import { useAuth } from '@/shared/composables/useAuth';

const { replace } = vi.hoisted(() => ({
  replace: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/router', () => ({
  default: { replace },
}));

vi.mock('@/shared/composables/useTenant', () => ({
  useTenant: () => ({ resetTenantSession: vi.fn() }),
}));

vi.mock('@/shared/composables/useShellEmbed', () => ({
  isIntegrationShellEmbed: () => false,
  isIntegrationShellIframeEmbed: () => false,
  readParentShellAuthSession: () => null,
}));

vi.mock('@/shared/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    me: vi.fn(),
  },
}));

describe('useAuth logout', () => {
  beforeEach(() => {
    localStorage.clear();
    clearAuthSession();
    replace.mockClear();
  });

  it('redirects standalone users back to login', async () => {
    setAuthSession('admin', 'x'.repeat(32), []);
    const { logout } = useAuth();

    await logout();

    expect(replace).toHaveBeenCalledWith({ path: '/login' });
  });
});
