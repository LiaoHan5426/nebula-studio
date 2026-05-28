export const tableComponentApiRows = [
  {
    name: 'data',
    type: 'unknown[]',
    description: '表格数据源',
  },
  {
    name: 'dragMode',
    type: "'none' | 'row' | 'column' | 'both'",
    description: '预留的拖拽模式参数，供后续 NebulaTable 拖拽扩展。',
  },
  {
    name: 'border / stripe / loading',
    type: 'boolean | string',
    description: '常用样式与状态控制，透传到底层 vxe-table。',
  },
];
