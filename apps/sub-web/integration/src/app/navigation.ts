import type { NavItem } from '@nebula-studio/nebula-layout';

export type IntegrationSurface = 'portal' | 'manage';

export const PORTAL_HOME = '/subscriptions';
export const PLATFORM_ADMIN_HOME = '/plugins/database';
export const USER_MANAGE_HOME = '/service/register';

export const portalNavItems: NavItem[] = [
  { key: 'subscriptions', label: '库表订阅', icon: '订', to: PORTAL_HOME },
  { key: 'my-services', label: '我的服务', icon: '服', to: '/my-interfaces' },
];

const serviceManagement: NavItem = {
  key: 'service',
  label: '服务管理',
  icon: '服',
  children: [
    { to: '/service/register', label: '服务注册' },
    { to: '/service/publish', label: '服务发布' },
    { to: '/service/approvals', label: '发布审批' },
    { to: '/service/releases', label: '发布管理' },
    { to: '/service/versions', label: '版本快照' },
    { to: '/service/authorize', label: '服务授权' },
    { to: '/service/governance', label: '服务治理' },
    { to: '/service/test', label: '服务测试' },
  ],
};

const integrationCore: NavItem = {
  key: 'integration-core',
  label: '集成编排',
  icon: '集',
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
  icon: '观',
  children: [
    { to: '/statistics/log-query', label: '日志查询' },
    { to: '/statistics/log-stats', label: '运行统计' },
    { to: '/statistics/topology', label: '服务拓扑' },
  ],
};

export const platformAdminNavItems: NavItem[] = [
  {
    key: 'plugins',
    label: '插件中心',
    icon: '插',
    children: [
      { to: '/plugins/database', label: '数据库适配插件' },
      { to: '/plugins/protocol', label: '协议插件' },
      { to: '/plugins/preprocessor', label: '前置处理器插件' },
      { to: '/plugins/postprocessor', label: '后置处理器插件' },
      { to: '/plugins/aggregator', label: '聚合插件' },
      { to: '/plugins/dispatcher', label: '分发插件' },
      { to: '/plugins/transformer', label: '转换插件' },
      { to: '/plugins/market', label: '插件市场' },
    ],
  },
  { key: 'tenant', label: '租户管理', icon: '租', to: '/tenant' },
  {
    ...serviceManagement,
    children: [
      ...(serviceManagement.children ?? []),
      { to: '/service/subscription-requests', label: '订阅审批' },
    ],
  },
  integrationCore,
  statistics,
];

export const userManageNavItems: NavItem[] = [
  { key: 'tenant', label: '我的租户', icon: '我', to: '/tenant' },
  serviceManagement,
  integrationCore,
  statistics,
];

function itemContainsPath(item: NavItem, path: string): boolean {
  if (item.to && (path === item.to || path.startsWith(`${item.to}/`))) {
    return true;
  }
  return item.children?.some((child) => path === child.to) ?? false;
}

export function surfaceForPath(path: string): IntegrationSurface {
  return portalNavItems.some((item) => itemContainsPath(item, path))
    ? 'portal'
    : 'manage';
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
