import type {
  GeneratedConfigItem,
  GeneratedFrontendApplicationView,
  GeneratedFrontendRuntimeEntryView,
  GeneratedOrganization,
  GeneratedPermission,
  GeneratedRole,
  GeneratedShellApp,
  GeneratedUser,
} from '../generated/facade.ts';

import type {
  ConfigItem,
  FrontendAppDriver,
  FrontendApplicationRecord,
  FrontendRuntimeEntry,
  OrganizationNode,
  PermissionNode,
  RoleRecord,
  ShellAppRecord,
  UserInput,
  UserRecord,
} from './models.ts';

export function mapUserFromGenerated(user: GeneratedUser): UserRecord {
  return {
    id: user.id ?? '',
    username: user.username ?? '',
    avatar: user.avatar,
    createdAt: user.createdAt,
    email: user.email,
    lastLoginAt: user.lastLoginAt,
    phone: user.phone,
    realName: user.realName,
    status: user.status,
    updatedAt: user.updatedAt,
  };
}

export function mapUserInputToGenerated(input: UserInput): GeneratedUser {
  return {
    username: input.username,
    email: input.email,
    password: input.password,
    phone: input.phone,
    realName: input.realName,
    status: input.status,
  };
}

export function mapRoleFromGenerated(role: GeneratedRole): RoleRecord {
  return {
    id: role.id ?? '',
    roleCode: role.roleCode ?? '',
    roleName: role.roleName ?? '',
    description: role.description,
    status: role.status,
  };
}

export function mapPermissionFromGenerated(
  permission: GeneratedPermission,
): PermissionNode {
  return {
    id: permission.id ?? '',
    permCode: permission.permCode ?? '',
    permName: permission.permName ?? '',
    parentId: permission.parentId ?? null,
    children: [],
    createdAt: permission.createdAt,
    description: permission.description,
    permType: permission.permType,
    sortOrder: permission.sortOrder,
    status: permission.status,
  };
}

export function mapOrganizationFromGenerated(
  organization: GeneratedOrganization,
): OrganizationNode {
  return {
    id: organization.id ?? '',
    orgCode: organization.orgCode ?? '',
    orgName: organization.orgName ?? '',
    parentId: organization.parentId ?? null,
    children: [],
    description: organization.description,
    level: organization.level,
    sortOrder: organization.sortOrder,
    status: organization.status,
  };
}

export function mapShellAppFromGenerated(
  app: GeneratedShellApp,
): ShellAppRecord {
  return {
    id: app.id ?? '',
    label: app.label ?? '',
    defaultEnabled: app.defaultEnabled,
    iconSvg: app.iconSvg,
    integratable: app.integratable,
    preload: app.preload,
    renderer: app.renderer,
    sortOrder: app.sortOrder,
    status: app.status,
  };
}

export function mapConfigItemFromGenerated(
  item: GeneratedConfigItem,
): ConfigItem {
  return {
    id: item.id ?? '',
    key: item.key ?? '',
    value: item.value ?? '',
    scope: item.scope ?? 'GLOBAL',
    group: item.group,
    tenantId: item.tenantId,
    type: item.type,
    updatedAt: item.updatedAt,
  };
}

function mapFrontendDriver(value?: string): FrontendAppDriver {
  if (
    value === 'federation' ||
    value === 'iframe' ||
    value === 'external' ||
    value === 'native'
  ) {
    return value;
  }
  return 'native';
}

export function mapFrontendApplicationFromGenerated(
  app: GeneratedFrontendApplicationView,
): FrontendApplicationRecord {
  return {
    id: app.id ?? '',
    name: app.name ?? '',
    driver: mapFrontendDriver(app.driver),
    electronEnabled: app.electronEnabled ?? true,
    roles: app.roles ?? [],
    webEnabled: app.webEnabled ?? true,
    category: app.category,
    defaultPath: app.defaultPath,
    description: app.description,
    icon: app.icon,
    routeBase: app.routeBase,
    sortOrder: app.sortOrder,
    status: app.status,
    tenantPolicy: app.tenantPolicy,
  };
}

export function mapFrontendRuntimeEntryFromGenerated(
  entry: GeneratedFrontendRuntimeEntryView,
): FrontendRuntimeEntry {
  return {
    id: entry.id ?? '',
    name: entry.name ?? '',
    driver: mapFrontendDriver(entry.driver),
    electronEnabled: entry.electronEnabled ?? true,
    roles: entry.roles ?? [],
    source: entry.source === 'shell-app' ? 'shell-app' : 'frontend',
    webEnabled: entry.webEnabled ?? true,
    allowedOrigins: entry.allowedOrigins,
    category: entry.category,
    channel: entry.channel,
    contractVersion: entry.contractVersion,
    defaultEnabled: entry.defaultEnabled,
    defaultPath: entry.defaultPath,
    description: entry.description,
    exposedModule: entry.exposedModule,
    helpKey: entry.helpKey,
    hostVersionRange: entry.hostVersionRange,
    icon: entry.icon,
    integratable: entry.integratable,
    integrity: entry.integrity,
    manifestUrl: entry.manifestUrl,
    preload: entry.preload,
    remoteName: entry.remoteName,
    renderer: entry.renderer,
    requiresAuth: entry.requiresAuth,
    returnTo: entry.returnTo,
    rolloutPercent: entry.rolloutPercent,
    routeBase: entry.routeBase,
    searchKeywords: entry.searchKeywords,
    signature: entry.signature,
    sortOrder: entry.sortOrder,
    version: entry.version,
  };
}
