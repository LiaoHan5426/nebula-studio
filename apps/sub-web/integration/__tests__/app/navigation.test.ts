import {
  expandedMenuForPath,
  homeForSurface,
  PLATFORM_ADMIN_HOME,
  platformAdminNavItems,
  PORTAL_HOME,
  portalNavItems,
  resolveIntegrationSurface,
  USER_MANAGE_HOME,
} from '@/app/navigation';
import router from '@/router';
import { describe, expect, it } from 'vitest';

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
    ]).toEqual([]);
    expect([...expandedMenuForPath(portalNavItems, PORTAL_HOME)]).toEqual([]);
    expect([...expandedMenuForPath(platformAdminNavItems, '/dag')]).toEqual([
      'integration-core',
    ]);
    expect([...expandedMenuForPath(platformAdminNavItems, '/flows')]).toEqual([
      'integration-core',
    ]);
  });

  it('exposes flow and DAG entries for platform admins', () => {
    const labels = platformAdminNavItems.flatMap((item) => [
      item.label,
      ...(item.children?.map((child) => child.label) ?? []),
    ]);
    expect(labels).toContain('流程定义');
    expect(labels).toContain('DAG 编排');
    expect(labels).toContain('服务发布');
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
