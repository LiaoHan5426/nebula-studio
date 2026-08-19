import { join } from 'node:path';

import { _electron as electron, expect, test } from '@playwright/test';

test('launch, preload capabilities, auth restoration and view switching', async ({
  browserName: _browserName,
}, testInfo) => {
  const launchStarted = performance.now();
  const electronApp = await electron.launch({
    args: [join(process.cwd(), 'apps/electron/out/main/index.js')],
  });

  try {
    const window = await electronApp.firstWindow();
    await expect(window.locator('[data-nebula-surface="shell"]')).toBeVisible({
      timeout: 20_000,
    });
    await expect(window.locator('[data-nebula-assembly]').first()).toBeVisible({
      timeout: 20_000,
    });

    const capabilities = await window.evaluate(() => {
      const nebulaWindow = window as Window & {
        api?: {
          auth?: {
            establishSession(payload: {
              roles: string[];
              token: string;
              user: string;
            }): Promise<boolean>;
            getSession(): Promise<unknown>;
          };
          notify?: unknown;
          shell?: { openLogin(): Promise<boolean> };
        };
      };
      return {
        auth: typeof nebulaWindow.api?.auth?.getSession === 'function',
        shell: typeof nebulaWindow.api?.shell?.openLogin === 'function',
        notify: Boolean(nebulaWindow.api?.notify),
      };
    });
    expect(capabilities).toEqual({ auth: true, shell: true, notify: true });

    const restoredSession = await window.evaluate(async () => {
      const auth = (
        window as Window & {
          api: {
            auth: {
              establishSession(payload: {
                roles: string[];
                token: string;
                user: string;
              }): Promise<boolean>;
              getSession(): Promise<null | { roles?: string[]; user?: string }>;
            };
          };
        }
      ).api.auth;
      await auth.establishSession({
        user: 'electron-e2e',
        token: 'electron-e2e-token-nebula-studio',
        roles: ['ADMIN'],
      });
      return auth.getSession();
    });
    expect(restoredSession).toMatchObject({
      user: 'electron-e2e',
      roles: ['ADMIN'],
    });
    await window.reload();
    await expect(window.locator('[data-nebula-surface="shell"]')).toBeVisible({
      timeout: 20_000,
    });
    const sessionAfterReload = await window.evaluate(() =>
      (
        window as Window & {
          api: {
            auth: {
              getSession(): Promise<null | {
                roles?: string[];
                token?: string;
                user?: string;
              }>;
            };
          };
        }
      ).api.auth.getSession(),
    );
    expect(sessionAfterReload).toMatchObject({
      user: 'electron-e2e',
      token: 'electron-e2e-token-nebula-studio',
      roles: ['ADMIN'],
    });

    const switched = await window.evaluate(async () => {
      const ipc = (
        window as Window & {
          electron: {
            ipcRenderer: {
              invoke(channel: string, payload?: unknown): Promise<unknown>;
            };
          };
        }
      ).electron.ipcRenderer;
      const before = (await ipc.invoke('shell:get-state')) as {
        availableViewIds: string[];
      };
      const target = before.availableViewIds.find((id) => id === 'settings');
      if (!target) return { target: null, activeViewId: null };
      await ipc.invoke('shell:set-active-view', { viewId: target });
      const after = (await ipc.invoke('shell:get-state')) as {
        activeViewId: null | string;
      };
      return { target, activeViewId: after.activeViewId };
    });
    expect(switched).toEqual({
      target: 'settings',
      activeViewId: 'settings',
    });

    const catalogStarted = performance.now();
    const integrationUrl = new URL(window.url());
    integrationUrl.searchParams.set('renderer', 'integration');
    await window.goto(integrationUrl.toString());
    await window.getByRole('button', { name: '返回资源门户' }).click();
    await expect(
      window.getByRole('heading', {
        name: '找到下一项可复用能力',
      }),
    ).toBeVisible({ timeout: 20_000 });
    const catalogMs = Math.round(performance.now() - catalogStarted);

    await testInfo.attach('electron-performance.json', {
      contentType: 'application/json',
      body: Buffer.from(
        JSON.stringify(
          {
            runtime: 'electron',
            shellLaunchMs: Math.round(catalogStarted - launchStarted),
            catalogMs,
            catalogBudgetMs: 4_000,
          },
          null,
          2,
        ),
      ),
    });
    expect(
      catalogMs,
      'Electron resource catalog first-screen budget',
    ).toBeLessThan(4_000);

    await expect(window).toHaveScreenshot('electron-portal-light.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.02,
    });

    await window.evaluate(async () => {
      const ipc = (
        window as Window & {
          electron: {
            ipcRenderer: {
              invoke(channel: string, payload?: unknown): Promise<unknown>;
            };
          };
        }
      ).electron.ipcRenderer;
      await ipc.invoke('settings:theme:set', { theme: 'dark' });
    });
    await expect(window).toHaveScreenshot('electron-portal-dark.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.02,
    });
  } finally {
    await electronApp.close();
  }
});
