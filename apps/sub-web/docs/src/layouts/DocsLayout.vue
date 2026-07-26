<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink, RouterView } from 'vue-router';
import { NebulaDocsLayout } from '@nebula-studio/nebula-layout';
import '@/styles/doc-page.css';

const route = useRoute();

const sidebar = computed(() => route.meta.sidebar as string | undefined);
const pageTitle = computed(() => route.meta.title as string | undefined);
const pageCategory = computed(() =>
  sidebar.value === 'components'
    ? '组件参考'
    : sidebar.value === 'guide'
      ? '使用指南'
      : sidebar.value === 'patterns'
        ? '体验模式'
        : '',
);
const layoutTitle = computed(() => (sidebar.value ? pageTitle.value : ''));

const guideSidebar = [
  { text: '项目介绍', to: '/guide/intro' },
  { text: '安装指南', to: '/guide/install' },
  { text: '主题定制', to: '/guide/theming' },
];

const componentsSidebar = [
  {
    group: '通用',
    items: [
      { text: 'Button 按钮', to: '/components/button' },
      { text: 'ButtonGroup 按钮组', to: '/components/button-group' },
      { text: 'Icon 图标', to: '/components/icon' },
    ],
  },
  {
    group: '表单',
    items: [
      { text: 'Form 表单', to: '/components/form' },
      { text: 'Input 输入框', to: '/components/input' },
      { text: 'Select 选择器', to: '/components/select' },
      { text: 'Switch 开关', to: '/components/switch' },
      { text: 'Checkbox 多选框', to: '/components/checkbox' },
      { text: 'RadioGroup 单选组', to: '/components/radio-group' },
      { text: 'DatePicker 日期选择', to: '/components/date-picker' },
    ],
  },
  {
    group: '数据展示',
    items: [
      { text: 'Table 表格', to: '/components/table' },
      { text: 'Tag 标签', to: '/components/tag' },
      { text: 'Avatar 头像', to: '/components/avatar' },
      { text: 'Card 卡片', to: '/components/card' },
      { text: 'TreeMenu 树形菜单', to: '/components/tree-menu' },
      { text: 'Pagination 分页', to: '/components/pagination' },
      { text: 'Progress 进度条', to: '/components/progress' },
    ],
  },
  {
    group: '导航',
    items: [
      { text: 'Tabs 标签页', to: '/components/tabs' },
      { text: 'Dropdown 下拉菜单', to: '/components/dropdown' },
      { text: 'Anchor 锚点', to: '/components/anchor' },
    ],
  },
  {
    group: '反馈',
    items: [
      { text: 'Dialog 对话框', to: '/components/dialog' },
      { text: 'Drawer 抽屉', to: '/components/drawer' },
      { text: 'Tooltip 文字提示', to: '/components/tooltip' },
    ],
  },
];

const patternsSidebar = [
  { text: '全局体验基线', to: '/patterns/experience-baseline' },
];

function isActive(path: string): boolean {
  return route.path === path;
}
</script>

<template>
  <NebulaDocsLayout
    :title="layoutTitle"
    :eyebrow="pageCategory"
    content-width="wide"
    density="comfortable"
    navigation-label="文档导航"
    class="docs-layout"
  >
    <template #navigation>
      <RouterLink to="/" class="docs-nav__title">Nebula Studio</RouterLink>
      <nav class="docs-nav__links">
        <RouterLink
          to="/guide/intro"
          class="docs-nav__link"
          :class="{ 'docs-nav__link--active': sidebar === 'guide' }"
        >
          指南
        </RouterLink>
        <RouterLink
          to="/components/button"
          class="docs-nav__link"
          :class="{ 'docs-nav__link--active': sidebar === 'components' }"
        >
          组件
        </RouterLink>
        <RouterLink
          to="/patterns/experience-baseline"
          class="docs-nav__link"
          :class="{ 'docs-nav__link--active': sidebar === 'patterns' }"
        >
          体验模式
        </RouterLink>
      </nav>

      <div v-if="sidebar" class="docs-sidebar">
        <template v-if="sidebar === 'guide'">
          <div class="docs-sidebar__section">
            <h3 class="docs-sidebar__heading">指南</h3>
            <RouterLink
              v-for="item in guideSidebar"
              :key="item.to"
              :to="item.to"
              class="docs-sidebar__link"
              :class="{ 'docs-sidebar__link--active': isActive(item.to) }"
            >
              {{ item.text }}
            </RouterLink>
          </div>
        </template>

        <template v-else-if="sidebar === 'components'">
          <div
            v-for="section in componentsSidebar"
            :key="section.group"
            class="docs-sidebar__section"
          >
            <h3 class="docs-sidebar__heading">{{ section.group }}</h3>
            <RouterLink
              v-for="item in section.items"
              :key="item.to"
              :to="item.to"
              class="docs-sidebar__link"
              :class="{ 'docs-sidebar__link--active': isActive(item.to) }"
            >
              {{ item.text }}
            </RouterLink>
          </div>
        </template>

        <template v-else-if="sidebar === 'patterns'">
          <div class="docs-sidebar__section">
            <h3 class="docs-sidebar__heading">体验模式</h3>
            <RouterLink
              v-for="item in patternsSidebar"
              :key="item.to"
              :to="item.to"
              class="docs-sidebar__link"
              :class="{ 'docs-sidebar__link--active': isActive(item.to) }"
            >
              {{ item.text }}
            </RouterLink>
          </div>
        </template>
      </div>
    </template>

    <RouterView />
  </NebulaDocsLayout>
</template>

<style>
* {
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
  min-height: 0;
  margin: 0;
}

#app {
  display: flex;
  flex-direction: column;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
}
</style>

<style scoped>
.docs-layout {
  height: 100%;
}

.docs-nav__title {
  display: block;
  padding: 0 4px 16px;
  font-size: 17px;
  font-weight: 750;
  color: hsl(var(--foreground));
  letter-spacing: -0.02em;
  text-decoration: none;
  border-bottom: 1px solid hsl(var(--border) / 68%);
}

.docs-nav__links {
  display: grid;
  gap: 4px;
  margin-top: 12px;
}

.docs-nav__link {
  padding: 8px 10px;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
  text-decoration: none;
  border-radius: var(--radius-md);
  transition:
    color 0.2s,
    background-color 0.2s;
}

.docs-nav__link:hover,
.docs-nav__link--active {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 9%);
}

.docs-sidebar {
  padding-top: 18px;
}

.docs-sidebar__section {
  margin-bottom: 18px;
}

.docs-sidebar__heading {
  padding: 8px 12px 6px;
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: hsl(var(--foreground));
  letter-spacing: 0.02em;
}

.docs-sidebar__link {
  display: block;
  padding: 7px 12px;
  font-size: 13.5px;
  color: hsl(var(--muted-foreground));
  text-decoration: none;
  border-radius: var(--radius-md);
  transition:
    color 0.2s,
    background-color 0.2s;
}

.docs-sidebar__link:hover {
  color: hsl(var(--primary));
  background: hsl(var(--accent) / 72%);
}

.docs-sidebar__link--active {
  font-weight: 650;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 11%);
  box-shadow: inset 3px 0 0 hsl(var(--primary));
}

@media (max-width: 720px) {
  .docs-sidebar__section {
    margin-bottom: 8px;
  }
}
</style>
