import { expect, test } from '@playwright/test';

type ApiEnvelope<T> = {
  code?: number;
  isSuccess?: boolean;
  data?: T;
  error?: string;
};

type AuthSession = {
  token?: string;
};

function requireEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be provided`);
  }
  return value;
}

const testUsername = process.env.NEBULA_E2E_USERNAME ?? 'admin';
const testPassword = requireEnvironment('NEBULA_E2E_PASSWORD');
const gatewayApiKey = requireEnvironment('NEBULA_E2E_GATEWAY_API_KEY');

test.describe('real Nebula stack', () => {
  test('login, shell, search, catalog, settings, help and Platform domains', async ({
    page,
    request,
  }) => {
    const serviceChecks = [
      ['Platform Console', 'http://127.0.0.1:8090/api/platform/health'],
      ['Platform Integration', 'http://127.0.0.1:8080/actuator/health'],
      [
        'Platform Integration Executor',
        'http://127.0.0.1:8081/actuator/health',
      ],
    ] as const;

    for (const [service, path] of serviceChecks) {
      const response = await request.get(path);
      expect(response.ok(), `${service} health check failed: ${path}`).toBe(
        true,
      );
    }

    await page.goto('/?embed=login');
    await page.locator('input[autocomplete="username"]').fill(testUsername);
    await page
      .locator('input[autocomplete="current-password"]')
      .fill(testPassword);
    await page.getByRole('button', { name: '登录', exact: true }).click();
    await expect(page.locator('[data-nebula-surface="shell"]')).toBeVisible({
      timeout: 15_000,
    });
    const firstUseGuide = page.getByRole('dialog', {
      name: '帮助与任务引导',
    });
    await firstUseGuide
      .waitFor({ state: 'visible', timeout: 2_000 })
      .catch(() => undefined);
    if (await firstUseGuide.isVisible()) {
      await firstUseGuide.getByRole('button', { name: '跳过本次引导' }).click();
      await firstUseGuide.getByRole('button', { name: 'Close' }).click();
      await expect(firstUseGuide).toBeHidden();
    }

    await page.getByRole('button', { name: /全局搜索/ }).click();
    const globalSearch = page.getByRole('searchbox', { name: '全局搜索' });
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

    await page.goto('/?embed=settings');
    await page.getByRole('link', { name: '权限矩阵' }).click();
    await expect(
      page.getByRole('main').getByRole('heading', { name: '权限管理' }),
    ).toBeVisible();

    await page.goto('/');
    await page.getByRole('button', { name: '上下文帮助与任务引导' }).click();
    await expect(
      page.getByRole('dialog', { name: '帮助与任务引导' }),
    ).toBeVisible();

    const authSession = await page.evaluate(() => {
      const raw = sessionStorage.getItem('nebula-studio-auth-session');
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    });
    expect(authSession?.token).toBeTruthy();

    const monitorResponse = await request.get(
      '/api/monitor/statistics/call-count?tenantId=tenant-a&hours=24',
      { headers: { Authorization: `Bearer ${authSession?.token}` } },
    );
    expect(
      monitorResponse.ok(),
      'Platform Integration monitor API failed',
    ).toBe(true);

    const gatewayResponse = await request.get(
      '/api/integration/gateway/tenant-a/orders/query',
      { headers: { 'X-API-Key': gatewayApiKey } },
    );
    expect(
      gatewayResponse.status(),
      'Executor gateway must return a domain response, not a proxy/server error',
    ).toBeLessThan(500);

    const loginResponse = await request.post('/api/auth/login', {
      data: { username: testUsername, password: testPassword },
    });
    const loginBody = (await loginResponse.json()) as ApiEnvelope<{
      username?: string;
    }>;
    expect(
      loginResponse.ok(),
      'Platform Integration login contract failed',
    ).toBe(true);
    expect(loginBody.data?.username).toBe(testUsername);
  });
});
