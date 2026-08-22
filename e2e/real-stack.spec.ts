import { expect, test } from '@playwright/test';

import {
  resolveHealthChecks,
  resolveShellEmbedPath,
} from '@nebula-studio-internal/vite';

type ApiEnvelope<T> = {
  code?: number;
  data?: T;
  error?: string;
  isSuccess?: boolean;
};

type AuthSession = {
  token?: string;
};

const testUsername = process.env.NEBULA_E2E_USERNAME ?? 'admin';
const testPassword = process.env.NEBULA_E2E_PASSWORD ?? 'admin123';
const gatewayApiKey =
  process.env.NEBULA_E2E_GATEWAY_API_KEY ?? 'demo-api-key-tenant-a';
const serviceChecks = resolveHealthChecks(undefined, { host: '127.0.0.1' });

test.describe('real Nebula stack', () => {
  test('login, shell, search, catalog, settings, help and Platform domains', async ({
    page,
    request,
  }) => {
    for (const check of serviceChecks) {
      const response = await request.get(check.probeUrl);
      expect(
        response.ok(),
        `${check.label} health check failed: ${check.probeUrl}`,
      ).toBe(true);
    }

    await page.goto(resolveShellEmbedPath('login'));
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

    await page.goto(resolveShellEmbedPath('docs'));
    await expect(
      page.getByRole('heading', { name: 'Nebula Studio 帮助中心' }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('[data-nebula-surface="shell"]')).toHaveCount(0);

    await page.goto(`${resolveShellEmbedPath('integration')}#/catalog`);
    await expect(
      page.getByRole('heading', { name: '找到下一项可复用能力' }),
    ).toBeVisible();
    await expect(page.getByRole('textbox', { name: '搜索资源' })).toBeVisible();

    await page.goto(`${resolveShellEmbedPath('integration')}#/plugins/market`);
    await expect(page.getByRole('heading', { name: '插件目录' })).toBeVisible();

    await page.goto(`${resolveShellEmbedPath('integration')}#/subscriptions`);
    await expect(page.getByRole('heading', { name: '库表订阅' })).toBeVisible();

    await page.goto(`${resolveShellEmbedPath('integration')}#/flows`);
    await expect(page.getByRole('heading', { name: '流程定义' })).toBeVisible({
      timeout: 20_000,
    });

    await page.goto(resolveShellEmbedPath('settings'));
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

    const runtimeResponse = await request.get(
      '/api/system/frontend-apps/runtime',
      {
        headers: {
          Authorization: `Bearer ${authSession?.token}`,
          'X-Tenant-Id': 'tenant-a',
        },
      },
    );
    expect(runtimeResponse.ok(), 'frontend runtime registry API failed').toBe(
      true,
    );
    const runtimeBody = (await runtimeResponse.json()) as ApiEnvelope<
      Array<{
        driver?: string;
        id?: string;
        manifestUrl?: string;
        remoteName?: string;
      }>
    >;
    const federationIds = (runtimeBody.data ?? [])
      .filter((entry) => entry.driver === 'federation')
      .map((entry) => entry.id);
    expect(federationIds).toEqual(
      expect.arrayContaining(['docs', 'settings', 'integration']),
    );
    for (const entry of runtimeBody.data ?? []) {
      if (entry.driver !== 'federation') continue;
      expect(entry.manifestUrl, `${entry.id} missing manifestUrl`).toBeTruthy();
      expect(entry.remoteName, `${entry.id} missing remoteName`).toBeTruthy();
    }

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
