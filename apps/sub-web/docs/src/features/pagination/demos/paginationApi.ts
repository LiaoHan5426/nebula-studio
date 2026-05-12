/** NebulaPagination（见 `packages/nebula-ui/src/components/pagination/NebulaPagination.ts`） */
export const paginationComponentApiRows = [
  {
    name: 'v-model (modelValue)',
    type: 'number',
    description: '当前页码（1-based）',
  },
  {
    name: 'total',
    type: 'number',
    description: '数据总条数，用于计算总页数',
  },
  {
    name: 'v-model:page-size (pageSize)',
    type: 'number',
    description: '每页条数',
  },
  {
    name: 'pageSizes',
    type: 'number[]',
    description: '可选每页条数，渲染为下拉选项',
  },
  {
    name: 'disabled',
    type: 'boolean',
    description: '禁用分页与条数切换',
  },
  {
    name: 'showSizeChanger',
    type: 'boolean',
    description: '是否展示「每页条数」下拉',
  },
  {
    name: 'change',
    type: '{ page: number; pageSize: number }',
    description: '页码或 pageSize 变化时触发',
  },
];
