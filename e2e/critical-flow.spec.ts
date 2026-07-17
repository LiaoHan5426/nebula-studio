import { expect, test } from '@playwright/test';

const TOKEN = 'mock-e2e-token-nebula-studio';

test('critical auth, Console, Executor, SSE, and logout flow', async ({
  page,
}) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        data: {
          token: TOKEN,
          username: 'e2e-user',
          currentOrgId: 'org-e2e',
          currentOrgName: 'E2E Org',
          organizations: [],
        },
      }),
    });
  });
  await page.route('**/api/console/health', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ code: 200, data: { status: 'UP' } }),
    }),
  );
  await page.route('**/api/console/tenant/mine', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ code: 200, data: [] }),
    }),
  );
  await page.route('**/api/executor/routes', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ code: 200, data: [] }),
    }),
  );
  await page.route('**/api/executor/gateway/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/plain', body: 'pong' }),
  );
  await page.route('**/api/console/events', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: 'event: ready\ndata: {"status":"UP"}\n\n',
    }),
  );

  await page.goto('/?embed=login');
  await page.locator('input[autocomplete="username"]').fill('e2e-user');
  await page.locator('input[autocomplete="current-password"]').fill('password');
  await Promise.all([
    page.waitForURL((url) => !url.searchParams.has('embed')),
    page.getByRole('button', { name: '登录', exact: true }).click(),
  ]);
  await page.waitForLoadState('domcontentloaded');

  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem('nebula-studio-auth-session')),
    )
    .toContain('e2e-user');

  await page.goto('/service/governance?embed=integration');
  await expect(page.getByRole('heading', { name: '服务治理' })).toBeVisible();

  const contracts = await page.evaluate(async () => {
    const [consoleResponse, executorResponse, gatewayResponse, sseResponse] =
      await Promise.all([
        fetch('/api/console/health'),
        fetch('/api/executor/routes'),
        fetch('/api/executor/gateway/tenant-e2e/ping'),
        fetch('/api/console/events'),
      ]);
    return {
      consoleStatus: consoleResponse.status,
      executorStatus: executorResponse.status,
      gatewayBody: await gatewayResponse.text(),
      sseType: sseResponse.headers.get('content-type'),
      sseBody: await sseResponse.text(),
    };
  });

  expect(contracts).toEqual({
    consoleStatus: 200,
    executorStatus: 200,
    gatewayBody: 'pong',
    sseType: 'text/event-stream',
    sseBody: 'event: ready\ndata: {"status":"UP"}\n\n',
  });

  await page.evaluate(() => {
    sessionStorage.removeItem('nebula-studio-auth-session');
    window.dispatchEvent(new CustomEvent('nebula:auth-unauthorized'));
  });
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem('nebula-studio-auth-session')),
    )
    .toBeNull();
});
