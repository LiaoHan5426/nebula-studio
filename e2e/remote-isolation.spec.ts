import { expect, test } from '@playwright/test';

import { expectAssemblyMarkers } from './helpers/expectAssemblyMarkers';
import { expectEmbedShellReady } from './helpers/expectEmbedShellReady';

/**
 * Deterministic Host isolation: a Federation Remote manifest failure must not
 * take down login or the workspace shell. Recovery after the fault is cleared
 * is the client-side rollback path (live mount / last-known-good).
 */
test.describe('Federation remote isolation', () => {
  test.describe.configure({ timeout: 90_000 });

  test('docs load failure leaves login and shell usable', async ({ page }) => {
    await page.route('**/mf-manifest.json', (route) => route.abort());

    await page.goto('/?embed=docs');
    await expect(page.getByRole('alert')).toContainText('无法加载文档应用', {
      timeout: 20_000,
    });

    await page.goto('/?embed=login');
    await expectEmbedShellReady(page);
    await expect(
      page.getByRole('button', { name: '登录', exact: true }),
    ).toBeVisible();

    await page.goto('/');
    await expectAssemblyMarkers(page);
  });

  test('docs recovers after the manifest is reachable again', async ({
    page,
  }) => {
    await page.route('**/mf-manifest.json', (route) => route.abort());
    await page.goto('/?embed=docs');
    await expect(page.getByRole('alert')).toContainText('无法加载文档应用', {
      timeout: 20_000,
    });

    await page.unroute('**/mf-manifest.json');
    await page.goto('/?embed=docs');
    await expect(
      page.getByRole('heading', { name: 'Nebula Studio 帮助中心' }),
    ).toBeVisible({ timeout: 20_000 });
  });
});
