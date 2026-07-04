import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Nebula Studio',
  description: 'Nebula Studio 组件库文档',
  lang: 'zh-CN',
  // base 由命令行参数 --base 控制，适配 GitHub Pages 部署
  base: process.env.VITEPRESS_BASE || '/',

  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/' },
      { text: '组件', link: '/components/button' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/' },
            { text: '主题定制', link: '/guide/theming' },
          ],
        },
      ],
      '/components/': [
        {
          text: '通用',
          items: [
            { text: 'Button 按钮', link: '/components/button' },
            { text: 'Icon 图标', link: '/components/icon' },
          ],
        },
        {
          text: '表单',
          items: [
            { text: 'Input 输入框', link: '/components/input' },
            { text: 'Select 选择器', link: '/components/select' },
            { text: 'Checkbox 复选框', link: '/components/checkbox' },
            { text: 'Radio 单选框', link: '/components/radio-group' },
            { text: 'Switch 开关', link: '/components/switch' },
            { text: 'DatePicker 日期选择', link: '/components/date-picker' },
          ],
        },
        {
          text: '数据展示',
          items: [
            { text: 'Table 表格', link: '/components/table' },
            { text: 'Pagination 分页', link: '/components/pagination' },
            { text: 'Tag 标签', link: '/components/tag' },
            { text: 'Card 卡片', link: '/components/card' },
            { text: 'Tabs 标签页', link: '/components/tabs' },
            { text: 'TreeMenu 树形菜单', link: '/components/tree-menu' },
          ],
        },
        {
          text: '反馈',
          items: [
            { text: 'Dialog 对话框', link: '/components/dialog' },
            { text: 'Drawer 抽屉', link: '/components/drawer' },
            { text: 'Notify 通知', link: '/components/notify' },
            { text: 'Tooltip 提示', link: '/components/tooltip' },
            { text: 'Progress 进度条', link: '/components/progress' },
          ],
        },
        {
          text: '导航',
          items: [
            { text: 'Dropdown 下拉菜单', link: '/components/dropdown' },
            { text: 'Anchor 锚点', link: '/components/anchor' },
          ],
        },
        {
          text: '内容',
          items: [
            { text: 'Editor 编辑器', link: '/components/editor' },
            { text: 'Reader 阅读器', link: '/components/reader' },
          ],
        },
      ],
    },

    outline: { level: [2, 3], label: '页面导航' },
    lastUpdatedText: '最后更新',
    docFooter: { prev: '上一篇', next: '下一篇' },
    search: { provider: 'local' },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/AliwareUI/nebula-studio' },
    ],
  },
});
