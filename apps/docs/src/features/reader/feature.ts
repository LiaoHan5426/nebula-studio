import ReaderFeaturePanel from './ReaderFeaturePanel.vue';
import type { DocsFeatureDefinition } from '../types';

const feature: DocsFeatureDefinition = {
  id: 'reader',
  title: 'Reader',
  description: 'NebulaReader：Markdown / plain 渲染与代码高亮（可与 Editor 分栏或独立使用）',
  menuPath: ['Content'],
  order: 26,
  component: ReaderFeaturePanel,
};

export default feature;
