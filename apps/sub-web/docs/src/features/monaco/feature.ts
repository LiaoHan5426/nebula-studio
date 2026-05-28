import EditorFeaturePanel from './MonacoFeaturePanel.vue';
import type { DocsFeatureDefinition } from '../types';

const feature: DocsFeatureDefinition = {
  id: 'monaco-editor',
  title: 'Monaco Editor',
  description:
    'Monaco Editor',
  menuPath: ['Content'],
  order: 25,
  component: EditorFeaturePanel,
};

export default feature;
