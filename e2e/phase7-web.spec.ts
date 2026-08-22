import { expect, test } from '@playwright/test';

const username = process.env.NEBULA_E2E_USERNAME ?? 'admin';
const password = process.env.NEBULA_E2E_PASSWORD ?? 'admin123';

async function dismissFirstUseGuide(
  page: import('@playwright/test').Page,
): Promise<void> {
  const firstUseGuide = page.getByRole('dialog', { name: '帮助与任务引导' });
  await firstUseGuide
    .waitFor({ state: 'visible', timeout: 2_000 })
    .catch(() => undefined);
  if (await firstUseGuide.isVisible()) {
    await firstUseGuide.getByRole('button', { name: '跳过本次引导' }).click();
    const close = firstUseGuide.getByRole('button', { name: 'Close' });
    if (await close.isVisible()) {
      await close.click();
    }
    await expect(firstUseGuide).toBeHidden();
  }
}

test.describe('Phase 7 live Web', () => {
  test('Host CSP and iframe guest are not the workspace SPA', async ({
    page,
    baseURL,
  }) => {
    const origin = baseURL ?? 'http://localhost:5173';
    const home = await page.goto(origin);
    expect(home?.ok()).toBeTruthy();
    const csp = await page
      .locator('meta[http-equiv="Content-Security-Policy"]')
      .getAttribute('content');
    expect(csp).toContain("frame-src 'self'");
    expect(csp).toContain('http://localhost:*');
    expect(csp).toContain('http://127.0.0.1:*');
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("object-src 'none'");

    await page.goto(`${origin}/iframe-guest.html`);
    await expect(
      page.getByRole('heading', { name: 'iframe guest' }),
    ).toBeVisible();
    await expect(page.getByText('Handshake:')).toContainText('waiting');
    await expect(page.locator('[data-nebula-surface="shell"]')).toHaveCount(0);
  });

  test('login, iframe handshake, and federation embed stay isolated', async ({
    page,
  }) => {
    await page.goto('/?embed=login');
    await page.locator('input[autocomplete="username"]').fill(username);
    await page.locator('input[autocomplete="current-password"]').fill(password);
    await page.getByRole('button', { name: '登录', exact: true }).click();
    await expect(page.locator('[data-nebula-surface="shell"]')).toBeVisible({
      timeout: 20_000,
    });
    await dismissFirstUseGuide(page);

    await page.getByRole('button', { name: '应用集成' }).click();
    await expect(
      page.getByRole('heading', { name: '应用启动器' }),
    ).toBeVisible();
    await expect(page.getByText('iframe 示例', { exact: true })).toBeVisible();
    await expect(
      page.getByText('跨源 iframe 示例', { exact: true }),
    ).toBeVisible();
    await expect(page.getByText('外部链接示例', { exact: true })).toBeVisible();

    await page.screenshot({
      path: 'test-results/phase7-web/launcher.png',
      fullPage: true,
    });

    await page.locator('.integration-tile', { hasText: 'iframe 示例' }).click();
    const guest = page.frameLocator(
      'iframe[title="Nebula Studio — iframe-demo"]',
    );
    await expect(
      guest.getByRole('heading', { name: 'iframe guest' }),
    ).toBeVisible({
      timeout: 10_000,
    });
    await expect(guest.getByText('Handshake:')).toContainText('ready');
    await page.screenshot({
      path: 'test-results/phase7-web/iframe-demo.png',
      fullPage: true,
    });

    await page.getByRole('button', { name: '应用集成' }).click();
    await page
      .locator('.integration-tile', { hasText: '跨源 iframe 示例' })
      .click();
    const crossGuest = page.frameLocator(
      'iframe[title="Nebula Studio — iframe-cross-demo"]',
    );
    await expect(
      crossGuest.getByRole('heading', { name: 'iframe guest' }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(crossGuest.getByText('Handshake:')).toContainText('ready');
    await page.screenshot({
      path: 'test-results/phase7-web/iframe-cross-demo.png',
      fullPage: true,
    });

    await page.goto('/?embed=docs');
    await expect(page.getByText('无法加载文档应用')).toHaveCount(0);
    await expect(
      page.locator('h1, h2, [data-nebula-assembly]').first(),
    ).toBeVisible({ timeout: 20_000 });
    await page.screenshot({
      path: 'test-results/phase7-web/docs-embed.png',
      fullPage: true,
    });
  });
});
