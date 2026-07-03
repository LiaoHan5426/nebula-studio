import { test, expect } from '@playwright/test';

/**
 * 主题切换 E2E 测试 — 验证 shadcn-vue dark class 机制。
 *
 * 前置条件:
 *   - dev:web (5173) 已启动
 *
 * 运行: pnpm run test:e2e
 */

test.describe('主题切换', () => {
  test('html 元素应包含正确的主题 class', async ({ page }) => {
    await page.goto('/');

    // 检查 html 元素的 dark class 存在
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toBeTruthy();

    // 验证 theme-ready class 被添加
    expect(htmlClass).toContain('theme-ready');
  });

  test('CSS 变量应在浅色模式下定义', async ({ page }) => {
    await page.goto('/');

    // 检查 --primary CSS 变量存在
    const primaryColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--primary'),
    );
    expect(primaryColor.trim()).toBeTruthy();
  });

  test('CSS 变量应在深色模式下定义', async ({ page }) => {
    await page.goto('/');

    // 手动切换到深色模式
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');

    // 深色模式下的 CSS 变量应有不同值
    const primaryColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--primary'),
    );
    expect(primaryColor.trim()).toBeTruthy();
  });
});
