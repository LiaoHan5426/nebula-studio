import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

import SettingsLayout from '@/layout/SettingsLayout.vue';
import { hasValidAuthToken } from '@nebula-studio/auth-provider/session';
import { detectRuntimeMode } from '@nebula-studio/runtime';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: SettingsLayout,
    redirect: '/users',
    children: [
      {
        path: 'users',
        name: 'users',
        component: () => import('@/features/users/UsersPage.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'roles',
        name: 'roles',
        component: () => import('@/features/roles/RolesPage.vue'),
        meta: { title: '角色管理' },
      },
      {
        path: 'permissions',
        name: 'permissions',
        component: () => import('@/features/permissions/PermissionsPage.vue'),
        meta: { title: '权限管理' },
      },
      {
        path: 'organizations',
        name: 'organizations',
        component: () =>
          import('@/features/organizations/OrganizationsPage.vue'),
        meta: { title: '组织管理' },
      },
      {
        path: 'apps',
        name: 'apps',
        component: () => import('@/features/apps/AppsPage.vue'),
        meta: { title: '应用管理' },
      },
      {
        path: 'logs',
        name: 'logs',
        component: () => import('@/features/logs/LogsPage.vue'),
        meta: { title: '日志管理' },
      },
      {
        path: 'appearance',
        name: 'appearance',
        component: () => import('@/features/appearance/AppearancePage.vue'),
        meta: { title: '外观设置' },
      },
      {
        path: 'config',
        name: 'config',
        component: () => import('@/features/config/ConfigPage.vue'),
        meta: { title: '配置管理' },
      },
    ],
  },
  {
    path: '/index.html',
    redirect: '/users',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title ?? '设置'} - Nebula Studio`;

  // standalone 模式下无 token 拦截访问，embed/electron 不拦截（Shell 层管认证）
  if (detectRuntimeMode() === 'standalone' && !hasValidAuthToken()) {
    // 重定向到 login 子应用（standalone 端口约定：:5176）
    window.location.href = '/login';
    return;
  }

  next();
});

export default router;
