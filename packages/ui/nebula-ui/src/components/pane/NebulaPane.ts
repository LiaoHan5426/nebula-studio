import { defineComponent, h } from 'vue';
import { withTooltipAttrs } from '../../utils/tooltip';
import type { TooltipPlacement } from '../../utils/tooltip';

export const NebulaPane = defineComponent({
  name: 'NebulaPane',
  props: {
    title: {
      type: String,
      default: '',
    },
    description: {
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
  setup(props, { slots }) {
    return () =>
      h(
        'section',
        withTooltipAttrs(
          'nebula-pane',
          props.class,
          props.tooltip,
          props.tooltipPlacement,
        ),
        [
          (props.title || props.description) &&
            h('header', { class: 'nebula-pane__header' }, [
              props.title &&
                h('h2', { class: 'nebula-pane__title' }, props.title),
              props.description &&
                h('p', { class: 'nebula-pane__desc' }, props.description),
            ]),
          h('div', { class: 'nebula-pane__body' }, slots.default?.() ?? []),
        ],
      );
  },
});
