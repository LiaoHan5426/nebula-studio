import EditorFeaturePanel from './EditorFeaturePanel.vue';
import type { DocsFeatureDefinition } from '../types';

const feature: DocsFeatureDefinition = {
  id: 'editor',
  title: 'Editor',
  description:
    'NebulaEditor 工具栏（语法 / 内嵌预览）、Markdown 分栏、fence 混排、富文本',
  menuPath: ['Content'],
  order: 25,
  component: EditorFeaturePanel,
};

export default feature;
