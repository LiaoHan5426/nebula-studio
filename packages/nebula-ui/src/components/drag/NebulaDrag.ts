import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import Draggable from 'vuedraggable';

type ItemKeyFn<T> = (item: T) => string | number;

export const NebulaDrag = defineComponent({
  name: 'NebulaDrag',
  props: {
    modelValue: {
      type: Array as PropType<unknown[]>,
      default: () => [],
    },
    itemKey: {
      type: [String, Function] as PropType<string | ItemKeyFn<unknown>>,
      required: true,
    },
    tag: {
      type: String,
      default: 'div',
    },
    handle: {
      type: String,
      default: '',
    },
    group: {
      type: [String, Object] as PropType<string | Record<string, unknown>>,
      default: undefined,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    animation: {
      type: Number,
      default: 180,
    },
    ghostClass: {
      type: String,
      default: 'nebula-drag__ghost',
    },
    chosenClass: {
      type: String,
      default: 'nebula-drag__chosen',
    },
    dragClass: {
      type: String,
      default: 'nebula-drag__drag',
    },
    class: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue', 'start', 'end', 'change'],
  setup(props, { emit, slots }) {
    return () =>
      h(
        Draggable as unknown as object,
        {
          modelValue: props.modelValue,
          itemKey: props.itemKey,
          tag: props.tag,
          handle: props.handle || undefined,
          group: props.group,
          disabled: props.disabled,
          animation: props.animation,
          ghostClass: props.ghostClass,
          chosenClass: props.chosenClass,
          dragClass: props.dragClass,
          class: props.class,
          'onUpdate:modelValue': (next: unknown[]) =>
            emit('update:modelValue', next),
          onStart: (event: unknown) => emit('start', event),
          onEnd: (event: unknown) => emit('end', event),
          onChange: (event: unknown) => emit('change', event),
        },
        slots,
      );
  },
});
