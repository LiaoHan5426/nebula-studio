import { computed, defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import { NebulaButton } from './NebulaButton';
import { cn } from '../utils/cn';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export const NebulaPagination = defineComponent({
  name: 'NebulaPagination',
  props: {
    modelValue: {
      type: Number,
      default: 1,
    },
    total: {
      type: Number,
      default: 0,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    pageSizes: {
      type: Array as PropType<number[]>,
      default: () => [10, 20, 50, 100],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    showSizeChanger: {
      type: Boolean,
      default: true,
    },
    class: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue', 'update:pageSize', 'change'],
  setup(props, { emit, slots }) {
    const pageCount = computed(() =>
      Math.max(
        1,
        Math.ceil(Math.max(props.total, 0) / Math.max(props.pageSize, 1)),
      ),
    );
    const currentPage = computed(() =>
      clamp(props.modelValue, 1, pageCount.value),
    );

    function changePage(nextPage: number): void {
      const page = clamp(nextPage, 1, pageCount.value);
      emit('update:modelValue', page);
      emit('change', { page, pageSize: props.pageSize });
    }

    function changeSize(event: Event): void {
      const value = Number((event.target as HTMLSelectElement).value);
      if (!Number.isFinite(value) || value <= 0) return;
      emit('update:pageSize', value);
      const nextPage = clamp(
        currentPage.value,
        1,
        Math.max(1, Math.ceil(props.total / value)),
      );
      emit('update:modelValue', nextPage);
      emit('change', { page: nextPage, pageSize: value });
    }

    return () =>
      h('div', { class: cn('nebula-pagination', props.class) }, [
        slots.default?.({
          page: currentPage.value,
          pageCount: pageCount.value,
          pageSize: props.pageSize,
          total: props.total,
        }) ??
          h('span', { class: 'nebula-pagination__summary' }, [
            `Total ${props.total} | Page ${currentPage.value}/${pageCount.value}`,
          ]),
        props.showSizeChanger &&
          h('label', { class: 'nebula-pagination__size-wrap' }, [
            h('span', { class: 'nebula-pagination__size-label' }, 'Page size'),
            h(
              'select',
              {
                class: 'nebula-pagination__size-select',
                disabled: props.disabled,
                value: props.pageSize,
                onChange: changeSize,
              },
              props.pageSizes.map((size) =>
                h('option', { key: size, value: size }, `${size}`),
              ),
            ),
          ]),
        h('div', { class: 'nebula-pagination__actions' }, [
          h(
            NebulaButton,
            {
              variant: 'secondary',
              disabled: props.disabled || currentPage.value <= 1,
              onClick: () => changePage(currentPage.value - 1),
            },
            () => 'Prev',
          ),
          h(
            NebulaButton,
            {
              variant: 'secondary',
              disabled: props.disabled || currentPage.value >= pageCount.value,
              onClick: () => changePage(currentPage.value + 1),
            },
            () => 'Next',
          ),
        ]),
      ]);
  },
});
