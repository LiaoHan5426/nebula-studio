import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Reachability for Host embed URLs. Avoid `networkidle` — Federation/HMR/SSE
 * keep connections open. Avoid `body` not.toBeEmpty — an unmounted Host
 * route can be an empty body that still matches `<body></body>`.
 */
export async function expectEmbedShellReady(
  page: Page,
  options: { timeoutMs?: number } = {},
): Promise<void> {
  const timeout = options.timeoutMs ?? 15_000;
  await expect(
    page.locator('h1, h2, [data-nebula-assembly]').first(),
  ).toBeVisible({ timeout });
}
