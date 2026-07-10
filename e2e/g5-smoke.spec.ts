import { test, expect } from '@playwright/test';

/**
 * G5 关口冒烟：发布治理流程页面可达性。
 * 完整 E2E 需 platform-console + executor 后端运行。
 */
test.describe('G5 governance flow smoke', () => {
  test('integration governance pages are reachable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const paths = [
      '/service/publish',
      '/service/approvals',
      '/service/releases',
      '/service/versions',
    ];

    for (const path of paths) {
      await page.goto(path);
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });

  test('publish page shows service list or empty state', async ({ page }) => {
    await page.goto('/service/publish');
    await expect(page.getByRole('heading', { name: /服务发布/ })).toBeVisible({
      timeout: 15000,
    });
  });
});
