import { defineComponent, h } from 'vue';
import { cn } from '../../utils/cn';
import { withTooltipAttrs } from '../../utils/tooltip';
import type { TooltipPlacement } from '../../utils/tooltip';

type Variant = 'default' | 'ghost' | 'muted';

export const NebulaIconButton = defineComponent({
  name: 'NebulaIconButton',
  props: {
    type: {
      type: String,
      default: 'button',
    },
    variant: {
      type: String as () => Variant,
      default: 'ghost',
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
    title: {
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
    ariaLabel: {
      type: String,
      default: '',
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
          title: props.title || undefined,
          'aria-label': props.ariaLabel || props.title || undefined,
          ...withTooltipAttrs(
            cn(
              'nebula-icon-btn',
              `nebula-icon-btn--${props.variant}`,
              props.active && 'nebula-icon-btn--active',
            ),
            props.class,
            props.tooltip || props.title,
            props.tooltipPlacement,
          ),
          onClick: (event: MouseEvent) => emit('click', event),
        },
        slots.default?.() ?? [],
      );
  },
});
