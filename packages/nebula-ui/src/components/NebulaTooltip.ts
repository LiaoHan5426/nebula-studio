import { defineComponent, h } from 'vue';
import { withTooltipAttrs } from '../utils/tooltip';
import type { TooltipPlacement } from '../utils/tooltip';

export const NebulaTooltip = defineComponent({
  name: 'NebulaTooltip',
  props: {
    content: {
      type: String,
      required: true,
    },
    placement: {
      type: String as () => TooltipPlacement,
      default: 'top',
    },
    class: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'span',
        withTooltipAttrs(
          'nebula-tooltip-wrap',
          props.class,
          props.content,
          props.placement,
        ),
        slots.default?.() ?? [],
      );
  },
});
