import type { PropType } from 'vue';

import { computed, defineComponent, h } from 'vue';

import { VxeTable } from 'vxe-table';

import { cn } from '../../utils/cn';

type NebulaTableDragMode = 'both' | 'column' | 'none' | 'row';

const dragModeClasses: Record<NebulaTableDragMode, string> = {
  none: 'nebula-table--drag-none',
  row: 'nebula-table--drag-row',
  column: 'nebula-table--drag-column',
  both: 'nebula-table--drag-both',
};

export const NebulaTable = defineComponent({
  name: 'NebulaTable',
  props: {
    data: {
      type: Array as PropType<unknown[]>,
      default: () => [],
    },
    border: {
      type: [Boolean, String] as PropType<'full' | 'inner' | 'outer' | boolean>,
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
      type: String as PropType<'medium' | 'mini' | 'small'>,
      default: 'small',
    },
    height: {
      type: [String, Number] as PropType<number | string>,
      default: undefined,
    },
    maxHeight: {
      type: [String, Number] as PropType<number | string>,
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
    scrollX: {
      type: [Boolean, Object] as PropType<
        boolean | { enabled?: boolean; gt?: number }
      >,
      default: false,
    },
    dragMode: {
      type: String as PropType<NebulaTableDragMode>,
      default: 'none',
    },
    treeConfig: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined,
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

    const computedScrollX = computed(() =>
      typeof props.scrollX === 'boolean'
        ? { enabled: props.scrollX }
        : props.scrollX,
    );
    const scrollXEnabled = computed(() =>
      typeof props.scrollX === 'boolean'
        ? props.scrollX
        : props.scrollX?.enabled !== false,
    );

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
          scrollX: computedScrollX.value,
          treeConfig: props.treeConfig,
          class: cn(
            'nebula-table',
            !scrollXEnabled.value && 'nebula-table--no-scroll-x',
            dragModeClasses[props.dragMode],
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
