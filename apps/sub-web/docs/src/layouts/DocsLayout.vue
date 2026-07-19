<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink, RouterView } from 'vue-router';
import '@/styles/doc-page.css';

const route = useRoute();

const sidebar = computed(() => route.meta.sidebar as string | undefined);
const pageTitle = computed(() => route.meta.title as string | undefined);
const pageCategory = computed(() =>
  sidebar.value === 'components'
    ? '组件参考'
    : sidebar.value === 'guide'
      ? '使用指南'
      : '',
);

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

function isActive(path: string): boolean {
  return route.path === path;
}
</script>

<template>
  <div class="docs-layout">
    <!-- Top Navigation -->
    <header class="docs-nav">
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
      </nav>
    </header>

    <div class="docs-body">
      <!-- Sidebar -->
      <aside v-if="sidebar" class="docs-sidebar">
        <!-- Guide sidebar -->
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

        <!-- Components sidebar -->
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
      </aside>

      <!-- Main Content -->
      <main class="docs-content">
        <header v-if="sidebar && pageTitle" class="docs-page-header">
          <span class="docs-page-header__eyebrow">{{ pageCategory }}</span>
          <h1>{{ pageTitle }}</h1>
          <div class="docs-page-header__rule" />
        </header>
        <RouterView />
      </main>
    </div>
  </div>
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
  display: flex;
  flex-direction: column;
  height: 100%;
  background:
    radial-gradient(
      circle at 88% -10%,
      hsl(var(--primary) / 8%),
      transparent 30%
    ),
    hsl(var(--background));
}

.docs-nav {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  height: 56px;
  padding: 0 28px;
  background: hsl(var(--header) / 94%);
  border-bottom: 1px solid hsl(var(--border));
  box-shadow: 0 1px 0 hsl(var(--foreground) / 3%);
}

.docs-nav__title {
  margin-right: 32px;
  font-size: 17px;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: hsl(var(--foreground));
  text-decoration: none;
}

.docs-nav__links {
  display: flex;
  gap: 24px;
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

.docs-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.docs-sidebar {
  flex-shrink: 0;
  width: 260px;
  padding: 22px 14px;
  overflow-y: auto;
  background: hsl(var(--sidebar) / 70%);
  border-right: 1px solid hsl(var(--border));
}

.docs-sidebar__section {
  margin-bottom: 18px;
}

.docs-sidebar__heading {
  padding: 8px 12px 6px;
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: hsl(var(--foreground));
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

.docs-content {
  flex: 1;
  width: 100%;
  max-width: 1120px;
  padding: 34px 52px 64px;
  margin: 0 auto;
  overflow-y: auto;
}

.docs-page-header {
  max-width: 900px;
  margin-bottom: 24px;
}

.docs-page-header__eyebrow {
  font-size: 12px;
  font-weight: 700;
  color: hsl(var(--primary));
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.docs-page-header h1 {
  margin: 7px 0 14px;
  font-size: clamp(28px, 3vw, 36px);
  font-weight: 750;
  line-height: 1.2;
  letter-spacing: -0.035em;
}

.docs-page-header__rule {
  width: 48px;
  height: 3px;
  background: hsl(var(--primary));
  border-radius: 999px;
}

@media (max-width: 720px) {
  .docs-sidebar {
    width: 210px;
  }

  .docs-content {
    padding: 28px 24px 48px;
  }
}
</style>
