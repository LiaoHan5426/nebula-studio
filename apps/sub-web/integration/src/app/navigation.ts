import type { NavItem } from '@nebula-studio/nebula-layout';

export type IntegrationSurface = 'admin' | 'portal' | 'provider';

export const PORTAL_HOME = '/catalog';
export const PLATFORM_ADMIN_HOME = '/manage';
export const USER_MANAGE_HOME = '/provider';

export const portalNavItems: NavItem[] = [
  {
    key: 'catalog',
    label: '资源目录',
    icon: 'search',
    to: PORTAL_HOME,
  },
  {
    key: 'my-requests',
    label: '我的申请',
    icon: 'clock',
    to: '/my-requests',
  },
  {
    key: 'my-resources',
    label: '我的资源',
    icon: 'server',
    to: '/my-resources',
  },
];

const serviceManagement: NavItem = {
  key: 'service',
  label: '服务管理',
  icon: 'server',
  children: [
    { to: '/provider/services', label: '服务注册' },
    { to: '/provider/publish', label: '服务发布' },
    { to: '/provider/approvals', label: '发布申请' },
    { to: '/provider/releases', label: '发布记录' },
    { to: '/provider/versions', label: '版本快照' },
  ],
};

const integrationCore: NavItem = {
  key: 'integration-core',
  label: '集成编排',
  icon: 'workflow',
  children: [
    { to: '/datasources', label: '数据源' },
    { to: '/flows', label: '流程定义' },
    { to: '/dag', label: 'DAG 编排' },
    { to: '/tasks', label: '任务调度' },
    { to: '/executor/routes', label: 'Executor 路由' },
  ],
};

const statistics: NavItem = {
  key: 'statistics',
  label: '运行观测',
  icon: 'chart-no-axes-combined',
  children: [
    { to: '/statistics/log-query', label: '日志查询' },
    { to: '/statistics/log-stats', label: '运行统计' },
    { to: '/statistics/topology', label: '服务拓扑' },
  ],
};

export const platformAdminNavItems: NavItem[] = [
  {
    key: 'admin-home',
    label: '治理首页',
    icon: 'layout-dashboard',
    to: PLATFORM_ADMIN_HOME,
  },
  {
    key: 'plugins',
    label: '插件中心',
    icon: 'puzzle',
    to: '/manage/plugins',
  },
  {
    key: 'tenant',
    label: '租户管理',
    icon: 'building-2',
    to: '/manage/tenants',
  },
  {
    key: 'approvals',
    label: '访问审批',
    icon: 'list-checks',
    to: '/manage/subscription-requests',
  },
  {
    key: 'governance',
    label: '治理策略',
    icon: 'shield-check',
    to: '/manage/governance',
  },
  statistics,
];

export const userManageNavItems: NavItem[] = [
  {
    key: 'provider-home',
    label: '提供方首页',
    icon: 'layout-dashboard',
    to: USER_MANAGE_HOME,
  },
  serviceManagement,
  {
    ...integrationCore,
    children: [
      { to: '/provider/datasources', label: '数据源' },
      { to: '/provider/flows', label: '流程定义' },
      { to: '/dag', label: 'DAG 编排' },
      { to: '/tasks', label: '任务调度' },
    ],
  },
];

export function resolveIntegrationSurface(
  value: unknown,
  platformAdmin: boolean,
): IntegrationSurface {
  if (value === 'portal' || value === 'provider' || value === 'admin') {
    return value;
  }
  return platformAdmin ? 'admin' : 'provider';
}

export function homeForSurface(
  surface: IntegrationSurface,
  platformAdmin: boolean,
): string {
  if (surface === 'portal') return PORTAL_HOME;
  return platformAdmin ? PLATFORM_ADMIN_HOME : USER_MANAGE_HOME;
}

export function expandedMenuForPath(
  items: NavItem[],
  path: string,
): Set<string> {
  const group = items.find((item) =>
    item.children?.some((child) => path === child.to),
  );
  return group ? new Set([group.key]) : new Set();
}
