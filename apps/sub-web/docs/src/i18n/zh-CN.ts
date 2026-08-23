import type { MessageTree } from '@nebula-studio/i18n';

const zhCN: MessageTree = {
  shell: {
    brand: 'Nebula Studio',
    nav: '文档导航',
    help: '产品帮助',
    reference: '开发者参考',
    design: 'Design',
    search: '搜索全部帮助与参考',
    searchAria: '全文搜索文档',
    noMatch: '没有匹配文档',
    productHelp: '产品帮助',
    guide: '开发指南',
    components: '组件参考',
    patterns: '体验模式',
    support: '支持',
    troubleshooting: '故障排查',
    guidelines: '组件使用规范',
    examples: '组件示例',
  },
  category: {
    help: '产品帮助',
    reference: '开发者参考',
    guide: '开发指南',
    patterns: '体验模式',
    design: 'Design catalog',
    components: 'Primitives',
  },
  design: {
    tokens: {
      title: 'Tokens',
      description:
        'Foundation 与 semantic token。改 accent 不得带动 success / warning / danger。',
      foundation: 'Foundation',
      semantic: 'Semantic',
      status: 'Status',
      accent: 'Accent',
      statusHint: '状态色独立于主题色，用于成功、警告与危险语义。',
      accentHint: '主题色只影响 action-primary 等品牌变量。',
    },
    theme: {
      title: 'Theme matrix',
      description: '浅/深/系统、预设与自定义 accent、密度与对比度。',
      scheme: '颜色模式',
      accent: '主题色',
      density: '密度',
      contrast: '对比度',
      preview: '预览表面',
      standaloneHint:
        'Standalone 直接 applyResolvedTheme；Host 内走 theme.setPreference。',
    },
    patterns: {
      title: 'Patterns',
      description:
        'PageHeader、FilterBar、EntityList 示意与 Empty / Error / Forbidden。',
      header: 'PageHeader',
      filter: 'FilterBar',
      list: 'EntityList',
      empty: 'Empty',
      error: 'Error',
      forbidden: 'Forbidden',
      emptyTitle: '没有匹配结果',
      emptyBody: '调整筛选条件后再试。',
      errorTitle: '无法加载列表',
      errorBody: '请稍后重试或联系管理员。',
      forbiddenTitle: '没有访问权限',
      forbiddenBody: '当前角色不能查看该资源。',
    },
  },
};

export default zhCN;
