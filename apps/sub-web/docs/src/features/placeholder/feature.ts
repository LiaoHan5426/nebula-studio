import PlaceholderFeaturePanel from './PlaceholderFeaturePanel.vue';
import type { DocsFeatureDefinition } from '../types';

const feature: DocsFeatureDefinition = {
  id: 'placeholder',
  title: 'Coming Soon',
  description: '预留后续功能验证入口',
  menuPath: ['Sandbox'],
  order: 1000,
  component: PlaceholderFeaturePanel,
};

export default feature;
