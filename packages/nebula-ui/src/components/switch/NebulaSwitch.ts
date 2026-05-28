import { defineComponent, h } from 'vue';
import { useBooleanModel } from '../../composables/useBooleanModel';
import { withTooltipAttrs } from '../../utils/tooltip';
import type { TooltipPlacement } from '../../utils/tooltip';

export const NebulaSwitch = defineComponent({
  name: 'NebulaSwitch',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    class: {
      type: String,
      default: '',
    },
    tooltip: {
      type: String,
      default: '',
    },
    tooltipPlacement: {
      type: String as () => TooltipPlacement,
      default: 'top',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = useBooleanModel(
      () => props.modelValue,
      (next) => emit('update:modelValue', next),
    );

    return () =>
      h(
        'button',
        {
          type: 'button',
          role: 'switch',
          'aria-checked': String(model.value),
          ...withTooltipAttrs(
            ['nebula-switch', model.value && 'nebula-switch--on']
              .filter(Boolean)
              .join(' '),
            props.class,
            props.tooltip,
            props.tooltipPlacement,
          ),
          onClick: () => {
            model.value = !model.value;
          },
        },
        [
          h('span', { class: 'nebula-switch__track' }, [
            h('span', { class: 'nebula-switch__thumb' }),
          ]),
          props.label &&
            h('span', { class: 'nebula-switch__label' }, props.label),
        ],
      );
  },
});
