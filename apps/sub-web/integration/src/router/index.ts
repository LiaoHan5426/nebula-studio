import { createRouter, createWebHistory } from 'vue-router';
import type {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw,
} from 'vue-router';

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
const ServiceGovernancePage = () =>
  import('@/features/service/ServiceGovernancePage.vue');
// 服务统计页面
const LogQueryPage = () => import('@/features/statistics/LogQueryPage.vue');
const LogStatsPage = () => import('@/features/statistics/LogStatsPage.vue');
const TopologyPage = () => import('@/features/statistics/TopologyPage.vue');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/statistics/log-query',
  },
  {
    path: '/index.html',
    redirect: '/statistics/log-query',
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
  // 服务管理 - 服务治理
  {
    path: '/service/governance',
    name: 'service-governance',
    component: ServiceGovernancePage,
    meta: { title: '服务治理' },
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
    path: '/flows',
    name: 'flows',
    component: () => import('@/features/flows/FlowsPage.vue'),
    meta: { title: '流程定义' },
  },
  {
    path: '/gateway',
    name: 'gateway',
    component: () => import('@/features/gateway/GatewayDemoPage.vue'),
    meta: { title: '接口网关' },
  },
  // 用户端 - 我的接口
  {
    path: '/my-interfaces',
    name: 'my-interfaces',
    component: () => import('../shared/PlaceholderPage.vue'),
    meta: { title: '我的接口' },
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
    next();
  },
);

export default router;
