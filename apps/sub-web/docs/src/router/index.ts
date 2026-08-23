import type { RouteRecordRaw } from 'vue-router';

import { createRouter, createWebHistory } from 'vue-router';

import { defineExperiencePageMeta } from '@nebula-studio/nebula-layout';

import DocsLayout from '@/layouts/DocsLayout.vue';

function applyDocsExperienceMeta(records: RouteRecordRaw[]): RouteRecordRaw[] {
  return records.map((record) => {
    const title = String(record.meta?.title ?? record.name ?? '文档');
    const name = String(record.name ?? 'index');
    return {
      ...record,
      meta: {
        ...defineExperiencePageMeta({
          title,
          surface: 'docs',
          density: 'comfortable',
          helpKey: `docs.${name}`,
          roles: ['public'],
          keywords: [title, '文档', '帮助'],
        }),
        ...record.meta,
      },
      children: record.children
        ? applyDocsExperienceMeta(record.children)
        : undefined,
    } as RouteRecordRaw;
  });
}

const routes = applyDocsExperienceMeta([
  {
    path: '/',
    component: DocsLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/HomePage.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'help',
        name: 'product-help',
        redirect: '/help/consumer/getting-started',
        children: [
          {
            path: 'consumer/getting-started',
            name: 'help-consumer-getting-started',
            component: () => import('@/pages/ProductHelpPage.vue'),
            meta: {
              title: '消费者快速开始',
              sidebar: 'product-help',
              documentId: 'consumer-getting-started',
            },
          },
          {
            path: 'consumer/sign-in',
            name: 'help-consumer-sign-in',
            component: () => import('@/pages/ProductHelpPage.vue'),
            meta: {
              title: '登录、MFA 与账号恢复',
              sidebar: 'product-help',
              documentId: 'consumer-sign-in',
            },
          },
          {
            path: 'consumer/find-request',
            name: 'help-find-request',
            component: () => import('@/pages/ProductHelpPage.vue'),
            meta: {
              title: '查找并申请资源',
              sidebar: 'product-help',
              documentId: 'find-request',
            },
          },
          {
            path: 'consumer/connect-resource',
            name: 'help-connect-resource',
            component: () => import('@/pages/ProductHelpPage.vue'),
            meta: {
              title: '接入已获批资源',
              sidebar: 'product-help',
              documentId: 'connect-resource',
            },
          },
          {
            path: 'provider/getting-started',
            name: 'help-provider-getting-started',
            component: () => import('@/pages/ProductHelpPage.vue'),
            meta: {
              title: '提供方快速开始',
              sidebar: 'product-help',
              documentId: 'provider-getting-started',
            },
          },
          {
            path: 'provider/publish',
            name: 'help-provider-publish',
            component: () => import('@/pages/ProductHelpPage.vue'),
            meta: {
              title: '发布资源与版本',
              sidebar: 'product-help',
              documentId: 'publish-resource',
            },
          },
          {
            path: 'admin/getting-started',
            name: 'help-admin-getting-started',
            component: () => import('@/pages/ProductHelpPage.vue'),
            meta: {
              title: '管理员快速开始',
              sidebar: 'product-help',
              documentId: 'admin-getting-started',
            },
          },
          {
            path: 'admin/approvals',
            name: 'help-admin-approvals',
            component: () => import('@/pages/ProductHelpPage.vue'),
            meta: {
              title: '审批与风险判断',
              sidebar: 'product-help',
              documentId: 'approvals',
            },
          },
          {
            path: 'admin/plugin-configuration',
            name: 'help-admin-plugin-configuration',
            component: () => import('@/pages/ProductHelpPage.vue'),
            meta: {
              title: '插件安装与配置',
              sidebar: 'product-help',
              documentId: 'plugin-configuration',
            },
          },
          {
            path: 'admin/settings',
            name: 'help-admin-settings',
            component: () => import('@/pages/ProductHelpPage.vue'),
            meta: {
              title: 'Settings 治理',
              sidebar: 'product-help',
              documentId: 'settings',
            },
          },
          {
            path: 'troubleshooting',
            name: 'help-troubleshooting',
            component: () => import('@/pages/ProductHelpPage.vue'),
            meta: {
              title: '故障排查',
              sidebar: 'product-help',
              documentId: 'troubleshooting',
            },
          },
        ],
      },
      {
        path: 'reference/component-guidelines',
        name: 'reference-component-guidelines',
        component: () => import('@/pages/ProductHelpPage.vue'),
        meta: {
          title: '组件使用规范',
          sidebar: 'reference',
          documentId: 'component-guidelines',
        },
      },
      {
        path: 'guide',
        alias: '/reference/guide',
        name: 'guide',
        redirect: '/guide/intro',
        children: [
          {
            path: 'intro',
            name: 'guide-intro',
            component: () => import('@/pages/guide/IntroPage.vue'),
            meta: { title: '项目介绍', sidebar: 'guide' },
          },
          {
            path: 'install',
            name: 'guide-install',
            component: () => import('@/pages/guide/InstallPage.vue'),
            meta: { title: '安装指南', sidebar: 'guide' },
          },
          {
            path: 'theming',
            name: 'guide-theming',
            component: () => import('@/pages/guide/ThemingPage.vue'),
            meta: { title: '主题定制', sidebar: 'guide' },
          },
        ],
      },
      {
        path: 'components',
        alias: '/reference/components',
        name: 'components',
        redirect: '/components/button',
        children: [
          {
            path: 'button',
            name: 'comp-button',
            component: () => import('@/pages/components/ButtonPage.vue'),
            meta: { title: 'Button 按钮', sidebar: 'components' },
          },
          {
            path: 'button-group',
            name: 'comp-button-group',
            component: () => import('@/pages/components/ButtonGroupPage.vue'),
            meta: { title: 'ButtonGroup 按钮组', sidebar: 'components' },
          },
          {
            path: 'icon',
            name: 'comp-icon',
            component: () => import('@/pages/components/IconPage.vue'),
            meta: { title: 'Icon 图标', sidebar: 'components' },
          },
          {
            path: 'form',
            name: 'comp-form',
            component: () => import('@/pages/components/FormPage.vue'),
            meta: { title: 'Form 表单', sidebar: 'components' },
          },
          {
            path: 'input',
            name: 'comp-input',
            component: () => import('@/pages/components/InputPage.vue'),
            meta: { title: 'Input 输入框', sidebar: 'components' },
          },
          {
            path: 'select',
            name: 'comp-select',
            component: () => import('@/pages/components/SelectPage.vue'),
            meta: { title: 'Select 选择器', sidebar: 'components' },
          },
          {
            path: 'switch',
            name: 'comp-switch',
            component: () => import('@/pages/components/SwitchPage.vue'),
            meta: { title: 'Switch 开关', sidebar: 'components' },
          },
          {
            path: 'checkbox',
            name: 'comp-checkbox',
            component: () => import('@/pages/components/CheckboxPage.vue'),
            meta: { title: 'Checkbox 多选框', sidebar: 'components' },
          },
          {
            path: 'radio-group',
            name: 'comp-radio-group',
            component: () => import('@/pages/components/RadioGroupPage.vue'),
            meta: { title: 'RadioGroup 单选组', sidebar: 'components' },
          },
          {
            path: 'date-picker',
            name: 'comp-date-picker',
            component: () => import('@/pages/components/DatePickerPage.vue'),
            meta: { title: 'DatePicker 日期选择', sidebar: 'components' },
          },
          {
            path: 'tabs',
            name: 'comp-tabs',
            component: () => import('@/pages/components/TabsPage.vue'),
            meta: { title: 'Tabs 标签页', sidebar: 'components' },
          },
          {
            path: 'tag',
            name: 'comp-tag',
            component: () => import('@/pages/components/TagPage.vue'),
            meta: { title: 'Tag 标签', sidebar: 'components' },
          },
          {
            path: 'tooltip',
            name: 'comp-tooltip',
            component: () => import('@/pages/components/TooltipPage.vue'),
            meta: { title: 'Tooltip 文字提示', sidebar: 'components' },
          },
          {
            path: 'dropdown',
            name: 'comp-dropdown',
            component: () => import('@/pages/components/DropdownPage.vue'),
            meta: { title: 'Dropdown 下拉菜单', sidebar: 'components' },
          },
          {
            path: 'dialog',
            name: 'comp-dialog',
            component: () => import('@/pages/components/DialogPage.vue'),
            meta: { title: 'Dialog 对话框', sidebar: 'components' },
          },
          {
            path: 'drawer',
            name: 'comp-drawer',
            component: () => import('@/pages/components/DrawerPage.vue'),
            meta: { title: 'Drawer 抽屉', sidebar: 'components' },
          },
          {
            path: 'card',
            name: 'comp-card',
            component: () => import('@/pages/components/CardPage.vue'),
            meta: { title: 'Card 卡片', sidebar: 'components' },
          },
          {
            path: 'avatar',
            name: 'comp-avatar',
            component: () => import('@/pages/components/AvatarPage.vue'),
            meta: { title: 'Avatar 头像', sidebar: 'components' },
          },
          {
            path: 'progress',
            name: 'comp-progress',
            component: () => import('@/pages/components/ProgressPage.vue'),
            meta: { title: 'Progress 进度条', sidebar: 'components' },
          },
          {
            path: 'pagination',
            name: 'comp-pagination',
            component: () => import('@/pages/components/PaginationPage.vue'),
            meta: { title: 'Pagination 分页', sidebar: 'components' },
          },
          {
            path: 'table',
            name: 'comp-table',
            component: () => import('@/pages/components/TablePage.vue'),
            meta: { title: 'Table 表格', sidebar: 'components' },
          },
          {
            path: 'tree-menu',
            name: 'comp-tree-menu',
            component: () => import('@/pages/components/TreeMenuPage.vue'),
            meta: { title: 'TreeMenu 树形菜单', sidebar: 'components' },
          },
          {
            path: 'anchor',
            name: 'comp-anchor',
            component: () => import('@/pages/components/AnchorPage.vue'),
            meta: { title: 'Anchor 锚点', sidebar: 'components' },
          },
        ],
      },
      {
        path: 'patterns',
        alias: '/reference/patterns',
        name: 'patterns',
        redirect: '/patterns/experience-baseline',
        children: [
          {
            path: 'experience-baseline',
            name: 'experience-baseline',
            component: () =>
              import('@/pages/patterns/ExperienceBaselinePage.vue'),
            meta: { title: '全局体验基线', sidebar: 'patterns' },
          },
          {
            path: 'catalog',
            name: 'patterns-catalog',
            component: () => import('@/pages/patterns/PatternsCatalogPage.vue'),
            meta: { title: 'Patterns catalog', sidebar: 'patterns' },
          },
        ],
      },
      {
        path: 'design',
        name: 'design',
        redirect: '/design/tokens',
        children: [
          {
            path: 'tokens',
            name: 'design-tokens',
            component: () => import('@/pages/design/TokensPage.vue'),
            meta: { title: 'Tokens', sidebar: 'design' },
          },
          {
            path: 'theme-matrix',
            name: 'design-theme-matrix',
            component: () => import('@/pages/design/ThemeMatrixPage.vue'),
            meta: { title: 'Theme matrix', sidebar: 'design' },
          },
        ],
      },
    ],
  },
  {
    path: '/index.html',
    redirect: '/',
  },
]);

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  document.title = `${(to.meta.title as string) ?? '文档'} - Nebula Studio`;
  next();
});

export default router;
