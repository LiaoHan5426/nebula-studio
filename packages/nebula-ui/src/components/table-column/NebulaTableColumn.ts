import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import { VxeColumn } from 'vxe-table';

export const NebulaTableColumn = defineComponent({
  name: 'NebulaTableColumn',
  props: {
    field: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    width: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    minWidth: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    fixed: {
      type: String as PropType<'left' | 'right' | ''>,
      default: '',
    },
    align: {
      type: String as PropType<'left' | 'center' | 'right' | ''>,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
    sortable: {
      type: Boolean,
      default: false,
    },
    formatter: {
      type: [String, Function] as PropType<
        string | ((params: unknown) => unknown)
      >,
      default: undefined,
    },
    showOverflow: {
      type: [Boolean, String] as PropType<
        boolean | 'ellipsis' | 'title' | 'tooltip' | 'none'
      >,
      default: undefined,
    },
    treeNode: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    return () =>
      h(
        VxeColumn as unknown as object,
        {
          field: props.field || undefined,
          title: props.title || undefined,
          width: props.width,
          minWidth: props.minWidth,
          fixed: props.fixed || undefined,
          align: props.align || undefined,
          type: props.type || undefined,
          sortable: props.sortable,
          formatter: props.formatter,
          showOverflow: props.showOverflow,
          treeNode: props.treeNode,
        },
        slots,
      );
  },
});
