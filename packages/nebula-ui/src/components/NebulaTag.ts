import { defineComponent, h } from 'vue';
import { withTooltipAttrs } from '../utils/tooltip';
import type { TooltipPlacement } from '../utils/tooltip';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export const NebulaTag = defineComponent({
  name: 'NebulaTag',
  props: {
    variant: {
      type: String as () => Variant,
      default: 'default',
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
        'span',
        withTooltipAttrs(
          `nebula-tag nebula-tag--${props.variant}`,
          props.class,
          props.tooltip,
          props.tooltipPlacement,
        ),
        slots.default?.() ?? [],
      );
  },
});
