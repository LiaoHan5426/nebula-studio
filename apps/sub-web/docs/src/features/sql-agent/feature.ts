import SQLAgentFeaturePanel from './SQLAgentFeaturePanel.vue';
import type { DocsFeatureDefinition } from '../types';

const feature: DocsFeatureDefinition = {
  id: 'sql-agent',
  title: 'SQL Agent',
  description:
    'AI 驱动的 SQL 查询代理，支持自然语言转 SQL、自动图表生成等功能',
  menuPath: ['AI Agent'],
  order: 100,
  component: SQLAgentFeaturePanel,
};

export default feature;