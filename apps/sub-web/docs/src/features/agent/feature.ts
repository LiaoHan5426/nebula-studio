import AgentFeaturePanel from './AgentFeaturePanel.vue';
import type { DocsFeatureDefinition } from '../types';

const feature: DocsFeatureDefinition = {
  id: 'agent',
  title: 'AI Agent',
  description: 'AI 驱动的智能代理服务，支持自然语言转 SQL、SQL 加密等功能',
  menuPath: ['AI Agent'],
  order: 100,
  component: AgentFeaturePanel,
};

export default feature;
