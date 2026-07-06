import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import DocsLayout from '@/layouts/DocsLayout.vue';

const routes: RouteRecordRaw[] = [
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
        path: 'guide',
        name: 'guide',
        redirect: '/guide/intro',
        children: [
          {
            path: 'intro',
            name: 'guide-intro',
            component: () => import('@/docs/guide/intro.md'),
            meta: { title: '项目介绍', sidebar: 'guide' },
          },
          {
            path: 'install',
            name: 'guide-install',
            component: () => import('@/docs/guide/install.md'),
            meta: { title: '安装指南', sidebar: 'guide' },
          },
          {
            path: 'theming',
            name: 'guide-theming',
            component: () => import('@/docs/guide/theming.md'),
            meta: { title: '主题定制', sidebar: 'guide' },
          },
        ],
      },
      {
        path: 'components',
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
    ],
  },
  {
    path: '/index.html',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  document.title = `${(to.meta.title as string) ?? '文档'} - Nebula Studio`;
  next();
});

export default router;
