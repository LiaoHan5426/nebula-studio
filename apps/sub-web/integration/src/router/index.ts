import { createRouter, createWebHistory } from 'vue-router';
import type {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw,
} from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/subscriptions',
  },
  {
    path: '/index.html',
    redirect: '/subscriptions',
  },
  {
    path: '/connectors',
    name: 'connectors',
    component: () => import('@/features/connectors/ConnectorsPage.vue'),
    meta: { title: '连接器管理' },
  },
  {
    path: '/datasources',
    name: 'datasources',
    component: () => import('@/features/datasources/DataSourcesPage.vue'),
    meta: { title: '数据源管理' },
  },
  {
    path: '/subscriptions',
    name: 'subscriptions',
    component: () => import('@/features/subscriptions/SubscriptionsPage.vue'),
    meta: { title: '库表订阅' },
  },
  {
    path: '/interfaces',
    name: 'interfaces',
    component: () => import('@/features/interfaces/InterfacesPage.vue'),
    meta: { title: '接口管理' },
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
