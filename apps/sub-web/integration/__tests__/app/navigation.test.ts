import { describe, expect, it } from 'vitest';

import {
  PLATFORM_ADMIN_HOME,
  PORTAL_HOME,
  USER_MANAGE_HOME,
  expandedMenuForPath,
  homeForSurface,
  platformAdminNavItems,
  portalNavItems,
  resolveIntegrationSurface,
} from '@/app/navigation';
import router from '@/router';

describe('integration navigation model', () => {
  it('uses role-specific landing pages', () => {
    expect(homeForSurface('admin', true)).toBe(PLATFORM_ADMIN_HOME);
    expect(homeForSurface('provider', false)).toBe(USER_MANAGE_HOME);
    expect(homeForSurface('portal', true)).toBe(PORTAL_HOME);
    expect(homeForSurface('portal', false)).toBe(PORTAL_HOME);
  });

  it('resolves explicit route metadata without inspecting paths', () => {
    expect(resolveIntegrationSurface('portal', true)).toBe('portal');
    expect(resolveIntegrationSurface('provider', true)).toBe('provider');
    expect(resolveIntegrationSurface('admin', false)).toBe('admin');
    expect(resolveIntegrationSurface(undefined, true)).toBe('admin');
    expect(resolveIntegrationSurface(undefined, false)).toBe('provider');
  });

  it('opens the menu group containing the active route', () => {
    expect([
      ...expandedMenuForPath(platformAdminNavItems, PLATFORM_ADMIN_HOME),
    ]).toEqual(['plugins']);
    expect([...expandedMenuForPath(portalNavItems, PORTAL_HOME)]).toEqual([]);
  });

  it('assigns an explicit experience contract to every named page', () => {
    const pages = router.getRoutes().filter((route) => route.name);

    for (const page of pages) {
      expect(page.meta.surface).toBeTruthy();
      expect(page.meta.density).toBeTruthy();
      expect(page.meta.helpKey).toBeTruthy();
    }
  });
});
