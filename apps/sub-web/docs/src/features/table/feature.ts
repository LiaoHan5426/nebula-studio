import NebulaTableFeaturePanel from './NebulaTableFeaturePanel.vue';
import type { DocsFeatureDefinition } from '../types';

const feature: DocsFeatureDefinition = {
  id: 'nebula-table',
  title: 'Table',
  description:
    'NebulaTable / NebulaTableRow / NebulaTableColumn；含与 NebulaPagination 联动示例，完整分页文档见 Pagination',
  menuPath: ['Data Display'],
  order: 20,
  component: NebulaTableFeaturePanel,
};

export default feature;
