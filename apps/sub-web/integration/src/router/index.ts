import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/subscriptions',
  },
  {
    path: '/subscriptions',
    name: 'subscriptions',
    component: () => import('../views/SubscriptionsView.vue'),
    meta: { title: '库表订阅' },
  },
  {
    path: '/interfaces',
    name: 'interfaces',
    component: () => import('../views/InterfacesView.vue'),
    meta: { title: '接口管理' },
  },
  {
    path: '/connectors',
    name: 'connectors',
    component: () => import('../views/ConnectorsView.vue'),
    meta: { title: '连接器管理' },
  },
  {
    path: '/datasources',
    name: 'datasources',
    component: () => import('../views/DataSourcesView.vue'),
    meta: { title: '数据源管理' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'Nebula 集成平台'} - Nebula Studio`;
  next();
});

export default router;
