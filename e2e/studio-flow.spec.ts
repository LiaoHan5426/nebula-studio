import { test, expect } from '@playwright/test';

/**
 * Studio flow E2E — navigation smoke across login, settings, and integration.
 *
 * Full backend flows (Console API, Executor gateway, SSE) require
 * platform-console + camel-console running locally. These tests verify
 * shell routing and page reachability without requiring live APIs.
 */
test.describe('Studio navigation flow', () => {
  test('web shell loads and exposes embed routes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('login surface is reachable', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('settings surfaces are reachable', async ({ page }) => {
    const paths = ['/settings', '/settings/config', '/settings/users'];
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
      '/service/publish',
      '/service/governance',
      '/service/authorize',
      '/service/approvals',
      '/service/releases',
      '/service/versions',
      '/subscriptions',
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
});

test.describe('Integration page headings', () => {
  test('governance page shows title', async ({ page }) => {
    await page.goto('/service/governance');
    await expect(page.getByRole('heading', { name: '服务治理' })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('subscriptions page loads list region', async ({ page }) => {
    await page.goto('/subscriptions');
    await expect(page.locator('.subscriptions-page')).toBeVisible({
      timeout: 10_000,
    });
  });
});
