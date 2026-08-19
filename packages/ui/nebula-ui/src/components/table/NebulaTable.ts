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
    scrollY: {
      type: [Boolean, Object] as PropType<
        boolean | { enabled?: boolean; gt?: number }
      >,
      default: undefined,
    },
    virtualXConfig: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined,
    },
    virtualYConfig: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined,
    },
    dragMode: {
      type: String as PropType<NebulaTableDragMode>,
      default: 'none',
    },
    treeConfig: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined,
    },
    animat: {
      type: Boolean,
      default: true,
    },
    rowClassName: {
      type: [String, Function] as PropType<
        string | ((params: unknown) => string)
      >,
      default: undefined,
    },
    class: {
      type: String,
      default: '',
    },
  },
  setup (props, { slots }) {
    const computedRowConfig = computed(() => {
      const config = { ...props.rowConfig };
      if (props.rowKey && config.keyField == null) {
        config.keyField = props.rowKey;
      }
      return config;
    });

    const computedTreeConfig = computed(() => {
      if (!props.treeConfig) return undefined;
      const config = { ...props.treeConfig };
      if (props.rowKey && config.rowField == null) {
        config.rowField = props.rowKey;
      }
      return config;
    });

    const computedScrollX = computed(() =>
      typeof props.scrollX === 'boolean'
        ? { enabled: props.scrollX }
        : props.scrollX,
    );
    const computedScrollY = computed(() => {
      if (props.scrollY == null) return undefined;
      return typeof props.scrollY === 'boolean'
        ? { enabled: props.scrollY }
        : props.scrollY;
    });
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
          rowConfig: computedRowConfig.value,
          columnConfig: props.columnConfig,
          scrollX: computedScrollX.value,
          scrollY: computedScrollY.value,
          virtualXConfig: props.virtualXConfig,
          virtualYConfig: props.virtualYConfig,
          treeConfig: computedTreeConfig.value,
          animat: props.animat,
          rowClassName: props.rowClassName,
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
