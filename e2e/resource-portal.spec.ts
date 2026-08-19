import { expect, test } from '@playwright/test';

const TOKEN = 'mock-e2e-token-nebula-studio';

test.describe('resource discovery and access request portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((token) => {
      sessionStorage.setItem(
        'nebula-studio-auth-session',
        JSON.stringify({
          user: 'portal-user',
          userId: 'user-e2e',
          roles: [],
          token,
        }),
      );
      localStorage.setItem('tenant_id', 'tenant-e2e');
    }, TOKEN);
  });

  test('finds an API, opens details, submits and tracks a request', async ({
    page,
  }) => {
    let submittedRequest:
      | undefined
      | {
          interfaceId: string;
          reason: string;
          requestConfig: Record<string, unknown>;
          requestId: string;
          requestType: string;
          status: string;
        };

    await page.route(/^https?:\/\/[^/]+\/api\//, async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const path = url.pathname;
      const ok = (data: unknown) =>
        route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ code: 200, isSuccess: true, data }),
        });

      if (path.endsWith('/auth/me') || path.endsWith('/auth/mode')) {
        return ok({
          user: 'portal-user',
          userId: 'user-e2e',
          username: 'portal-user',
          roles: [],
          authType: 'token',
          orgEnabled: false,
          multiOrgEnabled: false,
        });
      }
      if (path.endsWith('/tenant/mine')) {
        return ok([
          {
            tenantId: 'tenant-e2e',
            tenantName: 'E2E 组织',
            status: 'ACTIVE',
          },
        ]);
      }
      if (path.endsWith('/interfaces')) {
        return ok({
          items: [
            {
              interfaceId: 'orders-api',
              tenantId: 'tenant-e2e',
              interfaceName: '订单查询 API',
              interfaceType: 'ATOMIC',
              endpointUri: '/orders',
              method: 'GET',
              authConfig: { authType: 'JWT', allowedTenants: [] },
              status: 'ACTIVE',
              createdAt: '2026-07-01T00:00:00Z',
              lastModifiedAt: '2026-07-26T00:00:00Z',
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
        });
      }
      if (path.endsWith('/connectors') || path.endsWith('/plugin-catalog')) {
        return ok([]);
      }
      if (path.endsWith('/resources')) {
        return ok({ records: [], total: 0, current: 1, size: 200 });
      }
      if (
        path.endsWith('/subscription-request') &&
        request.method() === 'POST'
      ) {
        const payload = request.postDataJSON() as {
          interfaceId: string;
          reason: string;
          requestConfig: Record<string, unknown>;
          requestType: string;
        };
        submittedRequest = {
          requestId: 'request-e2e',
          interfaceId: payload.interfaceId,
          requestType: payload.requestType,
          status: 'PENDING',
          reason: payload.reason,
          requestConfig: payload.requestConfig,
        };
        return ok(submittedRequest);
      }
      if (path.endsWith('/subscription-request/user/user-e2e')) {
        return ok(submittedRequest ? [submittedRequest] : []);
      }
      if (path.endsWith('/subscription/list')) {
        return ok({ items: [], total: 0, page: 1, pageSize: 100 });
      }
      return ok([]);
    });

    await page.goto('/?embed=integration#/catalog');
    await expect(page.locator('[data-nebula-assembly]').first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByRole('heading', { name: '找到下一项可复用能力' }),
    ).toBeVisible({ timeout: 15_000 });
    await page.getByRole('textbox', { name: '搜索资源' }).fill('订单');
    await expect(
      page.getByRole('heading', { name: '订单查询 API' }),
    ).toBeVisible();
    await expect(page).toHaveURL(/keyword=/);
    // The production surface runs in a Shell iframe. This top-level test
    // restores the same Shell session immediately before client navigation.
    await page.evaluate((token) => {
      sessionStorage.setItem(
        'nebula-studio-auth-session',
        JSON.stringify({
          user: 'portal-user',
          userId: 'user-e2e',
          roles: [],
          token,
        }),
      );
    }, TOKEN);

    await page
      .locator('article')
      .filter({ hasText: '订单查询 API' })
      .getByRole('button', { name: '查看详情' })
      .click();
    await expect(page).toHaveURL(/#\/catalog\/api/);
    await expect(
      page.getByRole('button', { name: '返回资源目录' }),
    ).toBeVisible();
    await page.getByRole('button', { name: '申请 API 访问' }).click();

    await page
      .getByLabel('用途说明')
      .fill('用于订单履约异常分析与内部运营跟进，仅读取必要字段。');
    await page.getByRole('button', { name: '继续' }).click();
    await page.getByRole('button', { name: '继续' }).click();
    await page.getByLabel('权限范围').fill('订单号与履约状态，只读');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: '继续' }).click();
    await page.getByRole('button', { name: '提交申请' }).click();

    await expect(
      page.getByRole('heading', { name: '申请已提交' }),
    ).toBeVisible();
    await page.getByRole('button', { name: '查看申请进度' }).click();
    await expect(
      page.getByRole('heading', { name: '订单查询 API' }),
    ).toBeVisible();
    await expect(page.getByText('审批中', { exact: true })).toBeVisible();
  });
});
