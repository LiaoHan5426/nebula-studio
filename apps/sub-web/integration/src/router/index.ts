import { createRouter, createWebHistory } from 'vue-router';
import type {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw,
} from 'vue-router';

import { hasValidAuthToken, clearAuthSession } from '@/shared/auth/session';
import { isPlatformAdmin } from '@/shared/auth/roles';
import { isIntegrationShellIframeEmbed } from '@/shared/composables/useShellEmbed';

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
  import('@/features/plugins/PluginMarketPage.vue');
// 服务统计页面
const LogQueryPage = () => import('@/features/statistics/LogQueryPage.vue');
const LogStatsPage = () => import('@/features/statistics/LogStatsPage.vue');
const TopologyPage = () => import('@/features/statistics/TopologyPage.vue');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () =>
      isPlatformAdmin() ? '/statistics/log-query' : '/service/register',
  },
  {
    path: '/index.html',
    redirect: () =>
      isPlatformAdmin() ? '/statistics/log-query' : '/service/register',
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
    meta: { title: '数据库适配插件' },
  },
  // 插件管理 - 协议插件
  {
    path: '/plugins/protocol',
    name: 'plugin-protocol',
    component: PluginsPage,
    meta: { title: '协议插件' },
  },
  // 插件管理 - 前置处理器插件
  {
    path: '/plugins/preprocessor',
    name: 'plugin-preprocessor',
    component: PluginsPage,
    meta: { title: '前置处理器插件' },
  },
  // 插件管理 - 后置处理器插件
  {
    path: '/plugins/postprocessor',
    name: 'plugin-postprocessor',
    component: PluginsPage,
    meta: { title: '后置处理器插件' },
  },
  // 插件管理 - 聚合插件
  {
    path: '/plugins/aggregator',
    name: 'plugin-aggregator',
    component: PluginsPage,
    meta: { title: '聚合插件' },
  },
  // 插件管理 - 分发插件
  {
    path: '/plugins/dispatcher',
    name: 'plugin-dispatcher',
    component: PluginsPage,
    meta: { title: '分发插件' },
  },
  // 插件管理 - 转换插件
  {
    path: '/plugins/transformer',
    name: 'plugin-transformer',
    component: PluginsPage,
    meta: { title: '转换插件' },
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
    meta: { title: '订阅审批', requiresAdmin: true },
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
    meta: { title: '插件市场' },
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
    meta: { title: '库表订阅' },
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
    name: 'my-interfaces',
    component: () => import('@/features/interfaces/MyInterfacesPage.vue'),
    meta: { title: '我的服务' },
  },
];

const router = createRouter({
  history: createWebHistory(),
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
      next();
      return;
    }

    const isPublic = to.meta.public === true || to.path === '/login';
    const hasToken = hasValidAuthToken();

    if (!hasToken && !isPublic) {
      clearAuthSession();
      next({ path: '/login', query: { redirect: to.fullPath } });
      return;
    }

    if (to.meta.requiresAdmin === true && !isPlatformAdmin()) {
      next({ path: '/service/register' });
      return;
    }

    next();
  },
);

export default router;
