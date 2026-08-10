import { getAuthRoles, getAuthUsername } from './session';

const PLATFORM_ROLES = new Set([
  'ADMIN',
  'ROLE_ADMIN',
  'ROLE_SUPER_ADMIN',
  'SUPER_ADMIN',
]);
const ORG_ROLES = new Set([
  ...PLATFORM_ROLES,
  'ORG_ADMIN',
  'ORGANIZATION_ADMIN',
  'ROLE_ORG_ADMIN',
]);

export function isSettingsPlatformAdmin(): boolean {
  return (
    getAuthRoles().some((role) => PLATFORM_ROLES.has(role)) ||
    getAuthUsername() === 'admin'
  );
}

export function isSettingsOrgAdmin(): boolean {
  return (
    isSettingsPlatformAdmin() ||
    getAuthRoles().some((role) => ORG_ROLES.has(role))
  );
}

export type SettingsAccess = 'organization' | 'personal' | 'platform';

export function resolveSettingsAccess(
  roles: string[],
  username?: null | string,
): { organization: boolean; platform: boolean } {
  const platform =
    roles.some((role) => PLATFORM_ROLES.has(role)) || username === 'admin';
  return {
    platform,
    organization: platform || roles.some((role) => ORG_ROLES.has(role)),
  };
}

export function canAccessSettings(level: SettingsAccess): boolean {
  if (level === 'personal') return true;
  const access = resolveSettingsAccess(getAuthRoles(), getAuthUsername());
  if (level === 'organization') return access.organization;
  return access.platform;
}
