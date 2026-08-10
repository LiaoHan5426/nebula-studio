import { expect, test } from '@playwright/test';

type BaselineSurface = {
  name: string;
  path: string;
  surface: 'admin' | 'auth' | 'docs' | 'portal' | 'settings' | 'shell';
};

const surfaces: BaselineSurface[] = [
  { name: 'shell', path: '/', surface: 'shell' },
  { name: 'login', path: '/?embed=login', surface: 'auth' },
  {
    name: 'portal',
    path: '/?embed=integration#/subscriptions',
    surface: 'portal',
  },
  {
    name: 'admin',
    path: '/?embed=integration#/plugins/database',
    surface: 'admin',
  },
  {
    name: 'settings',
    path: '/?embed=settings#/appearance',
    surface: 'settings',
  },
  {
    name: 'docs',
    path: '/?embed=docs#/patterns/experience-baseline',
    surface: 'docs',
  },
];

const viewports = [
  { name: 'mobile', width: 320, height: 760 },
  { name: 'tablet', width: 768, height: 900 },
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'wide', width: 1440, height: 960 },
] as const;

const themes = ['light', 'dark'] as const;

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    if (!new URL(route.request().url()).pathname.startsWith('/api/')) {
      await route.continue();
      return;
    }
    const { pathname } = new URL(route.request().url());
    let data: unknown = { items: [], total: 0, records: [] };
    if (pathname.endsWith('/auth/mode')) {
      data = { orgEnabled: false, multiOrgEnabled: false };
    } else if (
      pathname.endsWith('/connectors') ||
      pathname.endsWith('/datasources')
    ) {
      data = [];
    }
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        data,
      }),
    });
  });
});

for (const theme of themes) {
  for (const viewport of viewports) {
    test(`${theme} surfaces at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({
        colorScheme: theme,
        reducedMotion: 'reduce',
      });
      await page.addInitScript(
        ({ selectedTheme }) => {
          localStorage.setItem('nebula-studio-web-theme', selectedTheme);
          localStorage.setItem(
            'nebula.task-guides.v1',
            JSON.stringify({
              'first-login': true,
              'first-request': true,
              'first-publish': true,
            }),
          );
          const isLogin =
            new URL(window.location.href).searchParams.get('embed') === 'login';
          if (isLogin) {
            sessionStorage.removeItem('nebula-studio-auth-session');
            return;
          }
          const roles = window.location.hash.startsWith('#/plugins/')
            ? ['ADMIN']
            : ['USER'];
          sessionStorage.setItem(
            'nebula-studio-auth-session',
            JSON.stringify({
              user: 'visual-baseline',
              token: 'visual-baseline-token-nebula-studio',
              roles,
            }),
          );
        },
        { selectedTheme: theme },
      );

      for (const target of surfaces) {
        await page.goto(target.path);
        const surface = page.locator(
          `[data-nebula-surface="${target.surface}"]`,
        );
        await expect(surface).toBeVisible({ timeout: 10_000 });
        if (target.surface === 'shell') {
          await expect(
            page.getByRole('navigation', { name: '主导航' }),
          ).toBeVisible();
        } else {
          await expect(page.locator('main').first()).toBeVisible();
        }

        const horizontalOverflow = await page.evaluate(() => {
          const viewportWidth = document.documentElement.clientWidth;
          return {
            pageWidth: document.documentElement.scrollWidth,
            offenders: [...document.querySelectorAll<HTMLElement>('body *')]
              .filter((element) => {
                const bounds = element.getBoundingClientRect();
                return bounds.left < -1 || bounds.right > viewportWidth + 1;
              })
              .slice(0, 5)
              .map((element) => ({
                element: element.tagName.toLowerCase(),
                className: element.className,
                width: Math.round(element.getBoundingClientRect().width),
              })),
          };
        });
        expect(
          horizontalOverflow.pageWidth,
          `${target.name} overflows at ${viewport.width}px: ${JSON.stringify(horizontalOverflow.offenders)}`,
        ).toBe(viewport.width);

        await expect(surface).toHaveScreenshot(
          `${target.name}-${theme}-${viewport.name}.png`,
          {
            animations: 'disabled',
            caret: 'hide',
            maxDiffPixelRatio: 0.01,
          },
        );
      }
    });
  }
}

test('keyboard focus is visible on each interactive surface', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.addInitScript(() => {
    localStorage.setItem(
      'nebula.task-guides.v1',
      JSON.stringify({
        'first-login': true,
        'first-request': true,
        'first-publish': true,
      }),
    );
    const isLogin =
      new URL(window.location.href).searchParams.get('embed') === 'login';
    if (isLogin) {
      sessionStorage.removeItem('nebula-studio-auth-session');
      return;
    }
    const roles = window.location.hash.startsWith('#/plugins/')
      ? ['ADMIN']
      : ['USER'];
    sessionStorage.setItem(
      'nebula-studio-auth-session',
      JSON.stringify({
        user: 'keyboard-baseline',
        token: 'keyboard-baseline-token-nebula-studio',
        roles,
      }),
    );
  });

  for (const target of surfaces) {
    await page.goto(target.path);
    const surface = page.locator(`[data-nebula-surface="${target.surface}"]`);
    await expect(surface).toBeVisible({ timeout: 10_000 });
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus-visible')).toBeVisible();
  }
});
