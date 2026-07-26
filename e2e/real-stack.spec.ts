import { expect, test } from '@playwright/test';

type ApiEnvelope<T> = {
  code?: number;
  isSuccess?: boolean;
  data?: T;
  error?: string;
};

test.describe('real Nebula stack', () => {
  test('login, shell, search, catalog, settings, help and Camel domains', async ({
    page,
    request,
  }) => {
    const serviceChecks = [
      ['Platform Console', '/api/platform/health'],
      ['Camel Console', '/api/auth/mode'],
      ['Executor', '/api/executor/health'],
    ] as const;

    for (const [service, path] of serviceChecks) {
      const response = await request.get(path);
      expect(response.ok(), `${service} health check failed: ${path}`).toBe(
        true,
      );
    }

    await page.goto('/?embed=login');
    await page.locator('input[autocomplete="username"]').fill('admin');
    await page
      .locator('input[autocomplete="current-password"]')
      .fill('admin123');
    await page.getByRole('button', { name: /进入工作台|登录/ }).click();
    await expect(page.locator('[data-nebula-surface="shell"]')).toBeVisible({
      timeout: 15_000,
    });
    const firstUseGuide = page.getByRole('dialog', {
      name: '帮助与任务引导',
    });
    if (await firstUseGuide.isVisible()) {
      await firstUseGuide.getByRole('button', { name: '跳过本次引导' }).click();
    }

    await page.getByRole('button', { name: /全局搜索/ }).click();
    const globalSearch = page.getByRole('textbox', { name: '全局搜索' });
    await globalSearch.fill('资源');
    await expect(page.locator(':focus-visible')).toBeVisible();
    await page.keyboard.press('Escape');

    await page.goto('/?embed=integration#/catalog');
    await expect(
      page.getByRole('heading', { name: '找到下一项可复用能力' }),
    ).toBeVisible();
    await expect(page.getByRole('textbox', { name: '搜索资源' })).toBeVisible();

    await page.goto('/?embed=integration#/plugins/market');
    await expect(page.getByRole('heading', { name: '插件目录' })).toBeVisible();

    await page.goto('/?embed=integration#/subscriptions');
    await expect(page.getByRole('heading', { name: '库表订阅' })).toBeVisible();

    await page.goto('/?embed=settings#/permissions');
    await expect(page.getByRole('heading', { name: '权限管理' })).toBeVisible();

    await page.goto('/');
    await page.getByRole('button', { name: '上下文帮助与任务引导' }).click();
    await expect(page.getByText(/工作台|任务引导/).first()).toBeVisible();

    const monitorResponse = await request.get(
      '/api/monitor/statistics/call-count?tenantId=tenant-a&hours=24',
    );
    expect(monitorResponse.ok(), 'Camel Console monitor API failed').toBe(true);

    const gatewayResponse = await request.get(
      '/api/integration/gateway/tenant-a/orders/query',
      { headers: { 'X-API-Key': 'demo-api-key-tenant-a' } },
    );
    expect(
      gatewayResponse.status(),
      'Executor gateway must return a domain response, not a proxy/server error',
    ).toBeLessThan(500);

    const loginResponse = await request.post('/api/auth/login', {
      data: { username: 'admin', password: 'admin123' },
    });
    const loginBody = (await loginResponse.json()) as ApiEnvelope<{
      username?: string;
    }>;
    expect(loginResponse.ok(), 'Camel Console login contract failed').toBe(
      true,
    );
    expect(loginBody.data?.username).toBe('admin');
  });
});
