import IntegrationFeaturePanel from './IntegrationFeaturePanel.vue';
import type { DocsFeatureDefinition } from '../types';

const feature: DocsFeatureDefinition = {
  id: 'integration',
  title: 'Integration',
  description:
    '基于 Camel 的集成平台，支持库表订阅制和接口授权制，提供动态扩展的连接器机制',
  menuPath: ['Backend'],
  order: 40,
  component: IntegrationFeaturePanel,
};

export default feature;
