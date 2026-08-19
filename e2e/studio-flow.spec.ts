import { expect, test } from '@playwright/test';

import { expectAssemblyMarkers } from './helpers/expectAssemblyMarkers';

/**
 * Studio flow E2E — navigation smoke across login, settings, and integration.
 *
 * Embed routes use the same Web shell entry as production.
 */
test.describe('Studio navigation flow', () => {
  test('web shell loads and exposes embed routes', async ({ page }) => {
    await page.goto('/');
    await expectAssemblyMarkers(page);
  });

  test('login surface is reachable', async ({ page }) => {
    await page.goto('/?embed=login');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('settings surfaces are reachable', async ({ page }) => {
    const paths = [
      '/settings?embed=settings',
      '/settings/config?embed=settings',
      '/settings/users?embed=settings',
    ];
    for (const path of paths) {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });

  test('integration governance and subscription surfaces are reachable', async ({
    page,
  }) => {
    const paths = [
      '/?embed=integration#/service/publish',
      '/?embed=integration#/service/governance',
      '/?embed=integration#/service/authorize',
      '/?embed=integration#/service/approvals',
      '/?embed=integration#/service/releases',
      '/?embed=integration#/service/versions',
      '/?embed=integration#/subscriptions',
    ];

    for (const path of paths) {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });

  test('docs embed surface is reachable', async ({ page }) => {
    await page.goto('/?embed=docs');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('embedded sub-app exposes assembly mount root', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem(
        'nebula-studio-auth-session',
        JSON.stringify({
          user: 'e2e-user',
          token: 'mock-e2e-token-nebula-studio',
        }),
      );
    });
    await page.goto('/?embed=integration#/dag');
    await expectAssemblyMarkers(page, { timeoutMs: 15_000 });
  });
});

test.describe('Integration page headings', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem(
        'nebula-studio-auth-session',
        JSON.stringify({
          user: 'e2e-user',
          token: 'mock-e2e-token-nebula-studio',
        }),
      );
    });
  });

  test('governance page shows title', async ({ page }) => {
    await page.goto('/?embed=integration#/service/governance');
    await expect(page.getByRole('heading', { name: '服务治理' })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('subscriptions page loads list region', async ({ page }) => {
    await page.goto('/?embed=integration#/subscriptions');
    await expect(page.getByRole('heading', { name: '库表订阅' })).toBeVisible({
      timeout: 10_000,
    });
  });
});
