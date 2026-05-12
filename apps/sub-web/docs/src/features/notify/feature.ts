import NotifyFeaturePanel from './NotifyFeaturePanel.vue';
import type { DocsFeatureDefinition } from '../types';

const feature: DocsFeatureDefinition = {
  id: 'notify',
  title: 'Notify',
  description: '消息与通知协议验证',
  menuPath: ['Core'],
  order: 10,
  component: NotifyFeaturePanel,
};

export default feature;
