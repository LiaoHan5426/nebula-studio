import type {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw,
} from 'vue-router';

import type { ExperienceSurface } from '@nebula-studio/nebula-layout';

import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import { WEB_SHELL_EMBED_QUERY } from '@nebula-studio/app-shell';
import { defineExperiencePageMeta } from '@nebula-studio/nebula-layout';

import { PLATFORM_ADMIN_HOME, PORTAL_HOME } from '@/app/navigation';
import { isPlatformAdmin } from '@/shared/auth/roles';
import { clearAuthSession, hasValidAuthToken } from '@/shared/auth/session';
import { isIntegrationShellIframeEmbed } from '@/shared/composables/useShellEmbed';

function createIntegrationHistory() {
  // iframe 入口为 index.html?embed=integration；若用 History 模式导航到 /statistics/...
  // 会丢掉 embed 查询参数，刷新/重判时误走 Shell 或独立登录守卫。
  const params = new URLSearchParams(window.location.search);
  const embedSurface =
    params.get(WEB_SHELL_EMBED_QUERY) ??
    params.get('renderer') ??
    (window as Window & { __NEBULA_EMBED_SURFACE__?: string })
      .__NEBULA_EMBED_SURFACE__;
  const injectedMode = (window as Window & { __NEBULA_RUNTIME_MODE__?: string })
    .__NEBULA_RUNTIME_MODE__;
  if (embedSurface === 'integration' || injectedMode === 'platform-embed') {
    return createWebHashHistory();
  }
  return createWebHistory();
}

// 登录页：复用 login 子应用组件（@nebula-studio-renderer/login/app）
const LoginApp = () => import('@nebula-studio-renderer/login/app');

// 插件管理页面
const PluginsPage = () => import('@/features/plugins/PluginsPage.vue');
// 租户管理页面
const TenantPage = () => import('@/features/tenant/TenantPage.vue');
// 服务管理页面
const ServiceRegisterPage = () =>
  import('@/features/service/ServiceRegisterPage.vue');
const ServicePublishPage = () =>
  import('@/features/service/ServicePublishPage.vue');
const ServiceAuthorizePage = () =>
  import('@/features/service/ServiceAuthorizePage.vue');
const SubscriptionRequestsPage = () =>
  import('@/features/service/SubscriptionRequestsPage.vue');
const ServiceGovernancePage = () =>
  import('@/features/service/ServiceGovernancePage.vue');
// 发布管理页面
const ServiceReleasePage = () =>
  import('@/features/service/ServiceReleasePage.vue');
// 审批管理页面
const ServiceApprovalPage = () =>
  import('@/features/service/ServiceApprovalPage.vue');
// 版本管理页面
const ServiceVersionPage = () =>
  import('@/features/service/ServiceVersionPage.vue');
const ExecutorRoutesPage = () =>
  import('@/features/executor/ExecutorRoutesPage.vue');
const PluginMarketPage = () =>
  import('@/features/plugin-catalog/PluginCatalogPage.vue');
// 服务统计页面
const LogQueryPage = () => import('@/features/statistics/LogQueryPage.vue');
const LogStatsPage = () => import('@/features/statistics/LogStatsPage.vue');
const TopologyPage = () => import('@/features/statistics/TopologyPage.vue');
const ResourceCatalogPage = () =>
  import('@/features/resource-catalog/ResourceCatalogPage.vue');
const ResourceDetailPage = () =>
  import('@/features/resource-catalog/ResourceDetailPage.vue');
const AccessRequestPage = () =>
  import('@/features/resource-catalog/AccessRequestPage.vue');
const MyRequestsPage = () =>
  import('@/features/resource-catalog/MyRequestsPage.vue');
const MyResourcesPage = () =>
  import('@/features/resource-catalog/MyResourcesPage.vue');
const ManagementHomePage = () =>
  import('@/features/management/ManagementHomePage.vue');

function applyIntegrationExperienceMeta(
  records: RouteRecordRaw[],
): RouteRecordRaw[] {
  return records.map((record) => {
    const existingMeta = record.meta ?? {};
    const title = String(existingMeta.title ?? record.name ?? '集成平台');
    const surface =
      (existingMeta.surface as ExperienceSurface | undefined) ??
      (existingMeta.public === true ? 'auth' : 'provider');
    return {
      ...record,
      meta: {
        ...defineExperiencePageMeta({
          title,
          surface,
          density: surface === 'portal' ? 'comfortable' : 'compact',
          helpKey: `integration.${String(record.name ?? 'index')}`,
          roles:
            existingMeta.requiresAdmin === true
              ? ['platform-admin']
              : surface === 'auth'
                ? ['public']
                : ['authenticated'],
          keywords: [title, '集成平台'],
        }),
        ...existingMeta,
      },
      children: record.children
        ? applyIntegrationExperienceMeta(record.children)
        : undefined,
    } as RouteRecordRaw;
  });
}

const routes = applyIntegrationExperienceMeta([
  {
    path: '/',
    redirect: () => (isPlatformAdmin() ? PLATFORM_ADMIN_HOME : PORTAL_HOME),
  },
  {
    path: '/index.html',
    redirect: () => (isPlatformAdmin() ? PLATFORM_ADMIN_HOME : PORTAL_HOME),
  },
  {
    path: '/login',
    name: 'login',
    component: LoginApp,
    meta: { title: '登录', public: true },
  },
  // 插件管理 - 数据库适配插件
  {
    path: '/plugins/database',
    name: 'plugin-database',
    component: PluginsPage,
    meta: { title: '数据库适配插件', surface: 'admin' },
  },
  // 插件管理 - 协议插件
  {
    path: '/plugins/protocol',
    name: 'plugin-protocol',
    component: PluginsPage,
    meta: { title: '协议插件', surface: 'admin' },
  },
  // 插件管理 - 前置处理器插件
  {
    path: '/plugins/preprocessor',
    name: 'plugin-preprocessor',
    component: PluginsPage,
    meta: { title: '前置处理器插件', surface: 'admin' },
  },
  // 插件管理 - 后置处理器插件
  {
    path: '/plugins/postprocessor',
    name: 'plugin-postprocessor',
    component: PluginsPage,
    meta: { title: '后置处理器插件', surface: 'admin' },
  },
  // 插件管理 - 聚合插件
  {
    path: '/plugins/aggregator',
    name: 'plugin-aggregator',
    component: PluginsPage,
    meta: { title: '聚合插件', surface: 'admin' },
  },
  // 插件管理 - 分发插件
  {
    path: '/plugins/dispatcher',
    name: 'plugin-dispatcher',
    component: PluginsPage,
    meta: { title: '分发插件', surface: 'admin' },
  },
  // 插件管理 - 转换插件
  {
    path: '/plugins/transformer',
    name: 'plugin-transformer',
    component: PluginsPage,
    meta: { title: '转换插件', surface: 'admin' },
  },
  // 租户管理
  {
    path: '/tenant',
    name: 'tenant',
    component: TenantPage,
    meta: { title: '租户管理' },
  },
  // 服务管理 - 服务注册
  {
    path: '/service/register',
    name: 'service-register',
    component: ServiceRegisterPage,
    meta: { title: '服务注册' },
  },
  // 服务管理 - 服务发布
  {
    path: '/service/publish',
    name: 'service-publish',
    component: ServicePublishPage,
    meta: { title: '服务发布' },
  },
  // 服务管理 - 服务授权
  {
    path: '/service/authorize',
    name: 'service-authorize',
    component: ServiceAuthorizePage,
    meta: { title: '服务授权' },
  },
  // 服务管理 - 订阅审批
  {
    path: '/service/subscription-requests',
    name: 'service-subscription-requests',
    component: SubscriptionRequestsPage,
    meta: {
      title: '订阅审批',
      requiresAdmin: true,
      surface: 'admin',
    },
  },
  // 服务管理 - 服务治理
  {
    path: '/service/governance',
    name: 'service-governance',
    component: ServiceGovernancePage,
    meta: { title: '服务治理' },
  },
  // 服务管理 - 发布管理
  {
    path: '/service/releases',
    name: 'service-releases',
    component: ServiceReleasePage,
    meta: { title: '发布管理' },
  },
  // 服务管理 - 审批管理
  {
    path: '/service/approvals',
    name: 'service-approvals',
    component: ServiceApprovalPage,
    meta: { title: '审批管理' },
  },
  // 服务管理 - 版本管理
  {
    path: '/service/versions',
    name: 'service-versions',
    component: ServiceVersionPage,
    meta: { title: '版本管理' },
  },
  {
    path: '/executor/routes',
    name: 'executor-routes',
    component: ExecutorRoutesPage,
    meta: { title: 'Executor 路由' },
  },
  {
    path: '/plugins/market',
    name: 'plugin-market',
    component: PluginMarketPage,
    meta: { title: '插件市场', surface: 'admin' },
  },
  // 服务管理 - 服务测试（经 executor 网关调用已发布服务）
  {
    path: '/service/test',
    name: 'service-test',
    component: () => import('@/features/gateway/GatewayDemoPage.vue'),
    meta: { title: '服务测试' },
  },
  // 服务统计 - 日志查询
  {
    path: '/statistics/log-query',
    name: 'statistics-log-query',
    component: LogQueryPage,
    meta: { title: '日志查询' },
  },
  // 服务统计 - 日志统计
  {
    path: '/statistics/log-stats',
    name: 'statistics-log-stats',
    component: LogStatsPage,
    meta: { title: '日志统计' },
  },
  // 服务统计 - 服务拓扑
  {
    path: '/statistics/topology',
    name: 'statistics-topology',
    component: TopologyPage,
    meta: { title: '服务拓扑' },
  },
  {
    path: '/connectors',
    redirect: '/plugins/database',
  },
  {
    path: '/interfaces',
    redirect: '/service/register',
  },
  {
    path: '/datasources',
    name: 'datasources',
    component: () => import('@/features/datasources/DataSourcesPage.vue'),
    meta: { title: '数据源' },
  },
  {
    path: '/subscriptions',
    name: 'subscriptions',
    component: () => import('@/features/subscriptions/SubscriptionsPage.vue'),
    meta: { title: '库表订阅', surface: 'portal' },
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('@/features/tasks/TasksPage.vue'),
    meta: { title: '任务调度' },
  },
  {
    path: '/tasks/instances',
    name: 'task-instances',
    component: () => import('@/features/tasks/TaskInstancesPage.vue'),
    meta: { title: '任务实例' },
  },
  {
    path: '/cluster/nodes',
    name: 'cluster-nodes',
    component: () => import('@/features/cluster/ClusterNodesPage.vue'),
    meta: { title: 'Executor 节点' },
  },
  {
    path: '/flows',
    name: 'flows',
    component: () => import('@/features/flows/FlowsPage.vue'),
    meta: { title: '流程定义' },
  },
  {
    path: '/dag',
    name: 'dag',
    component: () => import('@/features/flows/DagOrchestrationPage.vue'),
    meta: { title: 'DAG 编排' },
  },
  {
    path: '/gateway',
    redirect: '/service/test',
  },
  // 用户端 - 我的接口
  {
    path: '/my-interfaces',
    redirect: '/my-resources',
  },
  {
    path: '/catalog',
    name: 'resource-catalog',
    component: ResourceCatalogPage,
    meta: { title: '资源目录', surface: 'portal' },
  },
  {
    path: '/catalog/:resourceId',
    name: 'resource-detail',
    component: ResourceDetailPage,
    meta: { title: '资源详情', surface: 'portal' },
  },
  {
    path: '/catalog/:resourceId/apply',
    name: 'access-request',
    component: AccessRequestPage,
    meta: { title: '申请资源', surface: 'portal' },
  },
  {
    path: '/my-requests',
    name: 'my-requests',
    component: MyRequestsPage,
    meta: { title: '我的申请', surface: 'portal' },
  },
  {
    path: '/my-resources',
    name: 'my-resources',
    component: MyResourcesPage,
    meta: { title: '我的资源', surface: 'portal' },
  },
  {
    path: '/provider/services',
    name: 'provider-services',
    component: ServiceRegisterPage,
    meta: { title: '服务注册', surface: 'provider' },
  },
  {
    path: '/provider/publish',
    name: 'provider-publish',
    component: ServicePublishPage,
    meta: {
      title: '服务发布',
      surface: 'provider',
      helpKey: 'integration.service-publish',
    },
  },
  {
    path: '/provider/approvals',
    name: 'provider-approvals',
    component: ServiceApprovalPage,
    meta: {
      title: '发布申请',
      surface: 'provider',
      helpKey: 'integration.service-approvals',
    },
  },
  {
    path: '/provider/releases',
    name: 'provider-releases',
    component: ServiceReleasePage,
    meta: { title: '发布记录', surface: 'provider' },
  },
  {
    path: '/provider/versions',
    name: 'provider-versions',
    component: ServiceVersionPage,
    meta: { title: '版本快照', surface: 'provider' },
  },
  {
    path: '/provider/datasources',
    name: 'provider-datasources',
    component: () => import('@/features/datasources/DataSourcesPage.vue'),
    meta: { title: '数据源', surface: 'provider' },
  },
  {
    path: '/provider/flows',
    name: 'provider-flows',
    component: () => import('@/features/flows/FlowsPage.vue'),
    meta: { title: '流程定义', surface: 'provider' },
  },
  {
    path: '/manage/plugins',
    name: 'manage-plugins',
    component: PluginMarketPage,
    meta: {
      title: '插件治理',
      surface: 'admin',
      requiresAdmin: true,
    },
  },
  {
    path: '/manage/tenants',
    name: 'manage-tenants',
    component: TenantPage,
    meta: {
      title: '租户管理',
      surface: 'admin',
      requiresAdmin: true,
    },
  },
  {
    path: '/manage/subscription-requests',
    name: 'manage-subscription-requests',
    component: SubscriptionRequestsPage,
    meta: {
      title: '访问审批',
      surface: 'admin',
      requiresAdmin: true,
      helpKey: 'integration.service-approvals',
    },
  },
  {
    path: '/manage/governance',
    name: 'manage-governance',
    component: ServiceGovernancePage,
    meta: {
      title: '治理策略',
      surface: 'admin',
      requiresAdmin: true,
    },
  },
  {
    path: '/provider',
    name: 'provider-home',
    component: ManagementHomePage,
    meta: { title: '提供方工作台', surface: 'provider' },
  },
  {
    path: '/manage',
    name: 'management-home',
    component: ManagementHomePage,
    meta: {
      title: '平台治理工作台',
      surface: 'admin',
      requiresAdmin: true,
    },
  },
]);

const router = createRouter({
  history: createIntegrationHistory(),
  routes,
});

router.beforeEach(
  (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    document.title = `${to.meta.title || '集成平台'} - Nebula Studio`;

    if (isIntegrationShellIframeEmbed()) {
      if (to.meta.requiresAdmin === true && !isPlatformAdmin()) {
        next({ path: PORTAL_HOME });
      } else {
        next();
      }
      return;
    }

    const isPublic = to.meta.public === true || to.path === '/login';
    const hasToken = hasValidAuthToken();

    if (to.path === '/login' && hasToken) {
      next(isPlatformAdmin() ? PLATFORM_ADMIN_HOME : PORTAL_HOME);
      return;
    }

    if (!hasToken && !isPublic) {
      clearAuthSession();
      next({ path: '/login', query: { redirect: to.fullPath } });
      return;
    }

    if (to.meta.requiresAdmin === true && !isPlatformAdmin()) {
      next({ path: PORTAL_HOME });
      return;
    }

    next();
  },
);

export default router;
