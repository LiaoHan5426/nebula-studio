import type { SettingsAccess } from '@/shared/auth/access';

import type { RouteRecordRaw } from 'vue-router';

import { createRouter, createWebHistory } from 'vue-router';

import { hasValidAuthToken } from '@nebula-studio/auth-provider/session';
import { defineExperiencePageMeta } from '@nebula-studio/nebula-layout';
import { getResolvedRuntimeMode } from '@nebula-studio/runtime';

import SettingsLayout from '@/layout/SettingsLayout.vue';
import { canAccessSettings } from '@/shared/auth/access';

function settingsMeta(
  title: string,
  helpKey: string,
  description: string,
  access: SettingsAccess = 'personal',
) {
  return {
    ...defineExperiencePageMeta({
      title,
      description,
      surface: 'settings',
      density: access === 'personal' ? 'comfortable' : 'compact',
      helpKey,
      roles: ['authenticated'],
      keywords: [title, '设置', '管理'],
    }),
    settingsAccess: access,
  };
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: SettingsLayout,
    redirect: () =>
      canAccessSettings('organization') ? '/governance' : '/profile',
    children: [
      {
        path: 'governance',
        name: 'settings-governance',
        component: () =>
          import('@/features/governance/SettingsGovernanceHome.vue'),
        meta: settingsMeta(
          '设置治理工作台',
          'settings.governance',
          '汇总成员、授权、配置和审计治理待办。',
          'organization',
        ),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/features/personal/ProfilePage.vue'),
        meta: settingsMeta(
          '个人资料',
          'settings.profile',
          '查看账号身份、角色和个人资料。',
        ),
      },
      {
        path: 'sessions',
        name: 'sessions',
        component: () => import('@/features/personal/SessionsPage.vue'),
        meta: settingsMeta(
          '登录会话',
          'settings.sessions',
          '查看当前设备会话并处理异常登录。',
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
        path: 'language',
        name: 'language',
        component: () => import('@/features/personal/LanguagePage.vue'),
        meta: settingsMeta(
          '语言与区域',
          'settings.language',
          '选择界面语言和区域表达方式。',
        ),
      },
      {
        path: 'organization/users',
        name: 'users',
        component: () => import('@/features/users/UsersPage.vue'),
        meta: settingsMeta(
          '用户管理',
          'settings.users',
          '管理平台用户、账号状态和基础资料。',
          'organization',
        ),
      },
      {
        path: 'access/roles',
        name: 'roles',
        component: () => import('@/features/roles/RolesPage.vue'),
        meta: settingsMeta(
          '角色管理',
          'settings.roles',
          '维护角色及其访问范围。',
          'organization',
        ),
      },
      {
        path: 'access/permissions',
        name: 'permissions',
        component: () => import('@/features/permissions/PermissionsPage.vue'),
        meta: settingsMeta(
          '权限管理',
          'settings.permissions',
          '查看和维护平台权限定义。',
          'platform',
        ),
      },
      {
        path: 'organization/structure',
        name: 'organizations',
        component: () =>
          import('@/features/organizations/OrganizationsPage.vue'),
        meta: settingsMeta(
          '组织管理',
          'settings.organizations',
          '维护组织结构与组织级策略。',
          'organization',
        ),
      },
      {
        path: 'platform/apps',
        name: 'apps',
        component: () => import('@/features/apps/AppsPage.vue'),
        meta: settingsMeta(
          '应用管理',
          'settings.apps',
          '注册和维护可用的 Studio 应用。',
          'platform',
        ),
      },
      {
        path: 'platform/audit',
        name: 'logs',
        component: () => import('@/features/logs/LogsPage.vue'),
        meta: settingsMeta(
          '审计日志',
          'settings.audit-logs',
          '查询关键操作与安全审计记录。',
          'platform',
        ),
      },
      {
        path: 'platform/config',
        name: 'config',
        component: () => import('@/features/config/ConfigPage.vue'),
        meta: settingsMeta(
          '配置管理',
          'settings.configuration',
          '管理全局、租户和应用范围的配置。',
          'platform',
        ),
      },
      { path: 'users', redirect: '/organization/users' },
      { path: 'roles', redirect: '/access/roles' },
      { path: 'permissions', redirect: '/access/permissions' },
      { path: 'organizations', redirect: '/organization/structure' },
      { path: 'apps', redirect: '/platform/apps' },
      { path: 'logs', redirect: '/platform/audit' },
      { path: 'config', redirect: '/platform/config' },
    ],
  },
  {
    path: '/index.html',
    redirect: () =>
      canAccessSettings('organization') ? '/governance' : '/profile',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title ?? '设置'} - Nebula Studio`;

  // standalone 模式下无 token 拦截访问，embed/electron 不拦截（Shell 层管认证）
  if (getResolvedRuntimeMode() === 'standalone' && !hasValidAuthToken()) {
    // 重定向到 login 子应用（standalone 端口约定：:5176）
    window.location.href = '/login';
    return;
  }

  const access =
    (to.meta.settingsAccess as SettingsAccess | undefined) ?? 'personal';
  if (!canAccessSettings(access)) {
    next({ path: '/profile', query: { denied: to.fullPath } });
    return;
  }

  next();
});

export default router;
