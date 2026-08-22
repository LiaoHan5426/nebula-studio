import type { Page } from '@playwright/test';

import { expect } from '@playwright/test';

export interface ExpectAssemblyMarkersOptions {
  /** Also assert confirm host mount node exists. */
  includeOverlayRoot?: boolean;
  timeoutMs?: number;
}

/**
 * Cross-host smoke: assembly mount root + overlay portal container.
 * Web mock-regression and Electron must assert the same pair.
 */
export async function expectAssemblyMarkers(
  page: Page,
  options: ExpectAssemblyMarkersOptions = {},
): Promise<void> {
  const timeout = options.timeoutMs ?? 20_000;
  await expect(page.locator('[data-nebula-assembly]').first()).toBeVisible({
    timeout,
  });
  await expect(
    page.locator('[data-nebula-overlay-container]').first(),
  ).toBeAttached({ timeout });
  if (options.includeOverlayRoot) {
    await expect(
      page.locator('[data-nebula-overlay-root]').first(),
    ).toBeAttached({ timeout });
  }
}
