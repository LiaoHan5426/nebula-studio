import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

import SettingsLayout from '@/layout/SettingsLayout.vue';
import { hasValidAuthToken } from '@nebula-studio/auth-provider/session';
import { defineExperiencePageMeta } from '@nebula-studio/nebula-layout';
import { detectRuntimeMode } from '@nebula-studio/runtime';

function settingsMeta(title: string, helpKey: string, description: string) {
  return defineExperiencePageMeta({
    title,
    description,
    surface: 'settings',
    density: 'compact',
    helpKey,
    roles: ['authenticated'],
    keywords: [title, '设置', '管理'],
  });
}

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
        meta: settingsMeta(
          '用户管理',
          'settings.users',
          '管理平台用户、账号状态和基础资料。',
        ),
      },
      {
        path: 'roles',
        name: 'roles',
        component: () => import('@/features/roles/RolesPage.vue'),
        meta: settingsMeta(
          '角色管理',
          'settings.roles',
          '维护角色及其访问范围。',
        ),
      },
      {
        path: 'permissions',
        name: 'permissions',
        component: () => import('@/features/permissions/PermissionsPage.vue'),
        meta: settingsMeta(
          '权限管理',
          'settings.permissions',
          '查看和维护平台权限定义。',
        ),
      },
      {
        path: 'organizations',
        name: 'organizations',
        component: () =>
          import('@/features/organizations/OrganizationsPage.vue'),
        meta: settingsMeta(
          '组织管理',
          'settings.organizations',
          '维护组织结构与组织级策略。',
        ),
      },
      {
        path: 'apps',
        name: 'apps',
        component: () => import('@/features/apps/AppsPage.vue'),
        meta: settingsMeta(
          '应用管理',
          'settings.apps',
          '注册和维护可用的 Studio 应用。',
        ),
      },
      {
        path: 'logs',
        name: 'logs',
        component: () => import('@/features/logs/LogsPage.vue'),
        meta: settingsMeta(
          '审计日志',
          'settings.audit-logs',
          '查询关键操作与安全审计记录。',
        ),
      },
      {
        path: 'appearance',
        name: 'appearance',
        component: () => import('@/features/appearance/AppearancePage.vue'),
        meta: settingsMeta(
          '外观设置',
          'settings.appearance',
          '调整主题和界面显示偏好。',
        ),
      },
      {
        path: 'config',
        name: 'config',
        component: () => import('@/features/config/ConfigPage.vue'),
        meta: settingsMeta(
          '配置管理',
          'settings.configuration',
          '管理全局、租户和应用范围的配置。',
        ),
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
