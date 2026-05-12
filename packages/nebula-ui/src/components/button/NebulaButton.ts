import { defineComponent, h } from 'vue';
import { cn } from '../../utils/cn';
import { withTooltipAttrs } from '../../utils/tooltip';
import type { TooltipPlacement } from '../../utils/tooltip';

type Variant = 'primary' | 'secondary' | 'ghost';

export const NebulaButton = defineComponent({
  name: 'NebulaButton',
  props: {
    type: {
      type: String,
      default: 'button',
    },
    variant: {
      type: String as () => Variant,
      default: 'secondary',
    },
    active: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
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
  emits: ['click'],
  setup(props, { slots, emit }) {
    return () =>
      h(
        'button',
        {
          type: props.type,
          disabled: props.disabled,
          ...withTooltipAttrs(
            cn(
              'nebula-btn',
              `nebula-btn--${props.variant}`,
              props.active && 'nebula-btn--active',
            ),
            props.class,
            props.tooltip,
            props.tooltipPlacement,
          ),
          onClick: (event: MouseEvent) => emit('click', event),
        },
        slots.default?.() ?? [],
      );
  },
});
