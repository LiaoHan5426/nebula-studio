import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import { VxeTable } from 'vxe-table';
import { cn } from '../../utils/cn';

type NebulaTableDragMode = 'none' | 'row' | 'column' | 'both';

export const NebulaTable = defineComponent({
  name: 'NebulaTable',
  props: {
    data: {
      type: Array as PropType<unknown[]>,
      default: () => [],
    },
    border: {
      type: [Boolean, String] as PropType<boolean | 'full' | 'inner' | 'outer'>,
      default: true,
    },
    stripe: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String as PropType<'mini' | 'small' | 'medium'>,
      default: 'small',
    },
    height: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    maxHeight: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    rowConfig: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined,
    },
    rowKey: {
      type: String,
      default: undefined,
    },
    columnConfig: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined,
    },
    dragMode: {
      type: String as PropType<NebulaTableDragMode>,
      default: 'none',
    },
    class: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots }) {
    const computedRowConfig = {
      ...props.rowConfig,
    };

    if (props.rowKey) {
      computedRowConfig.useKey = props.rowKey;
    }

    return () =>
      h(
        VxeTable as unknown as object,
        {
          data: props.data,
          border: props.border,
          stripe: props.stripe,
          size: props.size,
          height: props.height,
          maxHeight: props.maxHeight,
          rowConfig: computedRowConfig,
          columnConfig: props.columnConfig,
          class: cn(
            'nebula-table',
            `nebula-table--drag-${props.dragMode}`,
            props.class,
          ),
        },
        {
          ...slots,
          loading:
            slots.loading ||
            (props.loading
              ? () => h('div', { class: 'vxe-table--loading' }, '加载中...')
              : undefined),
        },
      );
  },
});

export type { NebulaTableDragMode };
