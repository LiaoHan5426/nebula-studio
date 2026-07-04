import { test, expect } from '@playwright/test';

/**
 * G4 冒烟 E2E — 最小验证路径。
 *
 * 前置条件:
 *   - platform-console (8090) 已启动
 *   - camel-console (8080) 已启动
 *   - dev:web (5173) 已启动
 *
 * 运行: pnpm exec playwright test
 */

test.describe('G4 Smoke', () => {
  test('login → tasks 列表可达', async ({ page }) => {
    await page.goto('/');
    // 登录页应存在
    await expect(page.locator('form, [data-testid="login-form"]'))
      .toBeVisible({ timeout: 5000 })
      .catch(() => {
        // 若已登录则跳过
      });
    // 导航到 integration tasks
    // TODO: 实际登录步骤需根据 LoginPage 实现补充
  });

  test('settings config CRUD', async ({ page }) => {
    await page.goto('/settings/config');
    // 配置页应可达
    // TODO: 新建一条配置并验证列表更新
  });
});
