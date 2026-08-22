import { expect, test } from '@playwright/test';

import { resolveStandaloneApp } from '@nebula-studio-internal/vite';

import { expectAssemblyMarkers } from './helpers/expectAssemblyMarkers';
import { injectMockAuthSession } from './helpers/injectMockAuthSession';

const docs = resolveStandaloneApp('docs');
const settings = resolveStandaloneApp('settings');
const integration = resolveStandaloneApp('integration');

/**
 * Standalone Vite remotes (own origin, `boot.ts` + `bootMicroApp`).
 * Not Host `/?embed=` Federation.
 */
test.describe('standalone remotes', () => {
  test('docs standalone loads without Host embed', async ({ page }) => {
    await page.goto(docs.baseUrl);
    await expect(
      page.getByRole('heading', { name: 'Nebula Studio 帮助中心' }),
    ).toBeVisible({ timeout: 20_000 });
    await expectAssemblyMarkers(page);
  });

  test('settings standalone login is the shared Login app', async ({
    page,
  }) => {
    await page.goto(`${settings.baseUrl}/login`);
    await expect(
      page.getByRole('button', { name: '登录', exact: true }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('settings standalone appearance after session', async ({ page }) => {
    await injectMockAuthSession(page);
    await page.goto(`${settings.baseUrl}/appearance`);
    await expect(page.getByText('外观与主题')).toBeVisible({
      timeout: 15_000,
    });
    await expectAssemblyMarkers(page);
  });

  test('integration standalone login is the shared Login app', async ({
    page,
  }) => {
    await page.goto(`${integration.baseUrl}/login`);
    await expect(
      page.getByRole('button', { name: '登录', exact: true }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('integration standalone catalog and flows after session', async ({
    page,
  }) => {
    await injectMockAuthSession(page);
    await page.goto(`${integration.baseUrl}/catalog`);
    await expect(
      page.getByRole('heading', { name: '找到下一项可复用能力' }),
    ).toBeVisible({ timeout: 20_000 });
    await expectAssemblyMarkers(page);

    await page.goto(`${integration.baseUrl}/flows`);
    await expect(page.getByRole('heading', { name: '流程定义' })).toBeVisible({
      timeout: 20_000,
    });
  });
});
