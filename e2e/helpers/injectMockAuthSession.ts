import type { Page } from '@playwright/test';

/** Token length must satisfy `hasValidAuthToken` (≥ 20). */
export const MOCK_E2E_AUTH_SESSION = {
  user: 'e2e-user',
  token: 'mock-e2e-token-nebula-studio',
  roles: ['ADMIN'],
};

export async function injectMockAuthSession(page: Page): Promise<void> {
  await page.addInitScript((session) => {
    sessionStorage.setItem(
      'nebula-studio-auth-session',
      JSON.stringify(session),
    );
  }, MOCK_E2E_AUTH_SESSION);
}
