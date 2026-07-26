import { expect, test } from '@playwright/test';

const catalogBudgetMs = 2_500;
const detailBudgetMs = 2_000;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      'nebula-studio-auth-session',
      JSON.stringify({
        user: 'performance-user',
        userId: 'performance-user',
        token: 'performance-baseline-token',
        roles: ['USER'],
      }),
    );
    localStorage.setItem('tenant_id', 'tenant-performance');
  });
  await page.route(/^https?:\/\/[^/]+\/api\//, async (route) => {
    const path = new URL(route.request().url()).pathname;
    let data: unknown = [];
    if (path.endsWith('/interfaces')) {
      data = {
        items: [
          {
            interfaceId: 'performance-api',
            tenantId: 'tenant-performance',
            interfaceName: '性能基线 API',
            interfaceType: 'ATOMIC',
            endpointUri: '/performance',
            method: 'GET',
            status: 'ACTIVE',
            authConfig: { authType: 'NONE', allowedTenants: [] },
            connectorId: 'http',
            requestMapping: {},
            responseMapping: {},
            requestSchema: { type: 'object', fields: {} },
            responseSchema: { type: 'object', fields: {} },
            subscriptionMode: 'APPROVAL',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 200,
      };
    } else if (path.endsWith('/resources')) {
      data = { records: [], total: 0, current: 1, size: 200 };
    }
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ code: 200, isSuccess: true, data }),
    });
  });
});

async function measuredNavigation(
  page: import('@playwright/test').Page,
  path: string,
  ready: import('@playwright/test').Locator,
) {
  const started = performance.now();
  await page.goto(path);
  await expect(ready).toBeVisible();
  return Math.round(performance.now() - started);
}

test('catalog and detail stay inside first-screen budgets', async ({
  page,
}, testInfo) => {
  const catalogMs = await measuredNavigation(
    page,
    '/?embed=integration#/catalog',
    page.getByRole('heading', { name: '找到下一项可复用能力' }),
  );
  const detailMs = await measuredNavigation(
    page,
    '/?embed=integration#/catalog/performance-api',
    page.getByRole('heading', { name: '性能基线 API' }),
  );

  await testInfo.attach('resource-performance.json', {
    contentType: 'application/json',
    body: Buffer.from(
      JSON.stringify(
        {
          runtime: 'web',
          catalogMs,
          catalogBudgetMs,
          detailMs,
          detailBudgetMs,
        },
        null,
        2,
      ),
    ),
  });

  expect(catalogMs, 'resource catalog first-screen budget').toBeLessThan(
    catalogBudgetMs,
  );
  expect(detailMs, 'resource detail first-screen budget').toBeLessThan(
    detailBudgetMs,
  );
});
