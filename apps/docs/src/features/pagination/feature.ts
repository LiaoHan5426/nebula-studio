import NebulaPaginationFeaturePanel from './NebulaPaginationFeaturePanel.vue';
import type { DocsFeatureDefinition } from '../types';

const feature: DocsFeatureDefinition = {
  id: 'nebula-pagination',
  title: 'Pagination',
  description: 'NebulaPagination 独立配置与表格联动',
  menuPath: ['Data Display'],
  order: 21,
  component: NebulaPaginationFeaturePanel,
};

export default feature;
