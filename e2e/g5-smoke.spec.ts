import { test } from '@playwright/test';

import { expectEmbedShellReady } from './helpers/expectEmbedShellReady';

/**
 * G5 关口冒烟：发布治理流程页面可达性。
 * 完整 E2E 需 platform-console + executor 后端运行。
 */
test.describe('G5 governance flow smoke', () => {
  test('integration governance pages are reachable', async ({ page }) => {
    const paths = [
      '/?embed=integration#/service/publish',
      '/?embed=integration#/service/approvals',
      '/?embed=integration#/service/releases',
      '/?embed=integration#/service/versions',
      '/?embed=integration#/flows',
      '/?embed=integration#/dag',
    ];

    for (const path of paths) {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      await expectEmbedShellReady(page);
    }
  });

  test('approval page heading visible', async ({ page }) => {
    await page.goto('/?embed=integration#/service/approvals');
    await expectEmbedShellReady(page);
  });

  test('releases page reachable', async ({ page }) => {
    await page.goto('/?embed=integration#/service/releases');
    await expectEmbedShellReady(page);
  });
});
