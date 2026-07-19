import { describe, expect, it } from 'vitest';

import {
  PLATFORM_ADMIN_HOME,
  PORTAL_HOME,
  USER_MANAGE_HOME,
  expandedMenuForPath,
  homeForSurface,
  platformAdminNavItems,
  portalNavItems,
  surfaceForPath,
} from '@/app/navigation';

describe('integration navigation model', () => {
  it('uses role-specific landing pages', () => {
    expect(homeForSurface('manage', true)).toBe(PLATFORM_ADMIN_HOME);
    expect(homeForSurface('manage', false)).toBe(USER_MANAGE_HOME);
    expect(homeForSurface('portal', true)).toBe(PORTAL_HOME);
    expect(homeForSurface('portal', false)).toBe(PORTAL_HOME);
  });

  it('derives the surface from the route instead of local tab state', () => {
    expect(surfaceForPath('/subscriptions')).toBe('portal');
    expect(surfaceForPath('/my-interfaces')).toBe('portal');
    expect(surfaceForPath('/plugins/database')).toBe('manage');
    expect(surfaceForPath('/service/register')).toBe('manage');
  });

  it('opens the menu group containing the active route', () => {
    expect([
      ...expandedMenuForPath(platformAdminNavItems, PLATFORM_ADMIN_HOME),
    ]).toEqual(['plugins']);
    expect([...expandedMenuForPath(portalNavItems, PORTAL_HOME)]).toEqual([]);
  });
});
