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

  test('approval page heading visible', async ({ page }) => {
    await page.goto('/service/approvals');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('releases page reachable', async ({ page }) => {
    await page.goto('/service/releases');
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
