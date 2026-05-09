import { computed, defineComponent, h } from 'vue';
import { withTooltipAttrs } from '../utils/tooltip';
import type { TooltipPlacement } from '../utils/tooltip';

export type NebulaThemeMode = 'light' | 'dark';

export const NebulaThemeToggle = defineComponent({
  name: 'NebulaThemeToggle',
  props: {
    theme: {
      type: String as () => NebulaThemeMode,
      default: 'dark',
    },
    class: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
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
  emits: ['update:theme', 'toggle'],
  setup(props, { emit }) {
    const isDark = computed(() => props.theme === 'dark');

    const toggleTheme = (): void => {
      if (props.disabled) return;
      const nextTheme: NebulaThemeMode = isDark.value ? 'light' : 'dark';
      emit('update:theme', nextTheme);
      emit('toggle', nextTheme);
    };

    return () =>
      h(
        'button',
        {
          type: 'button',
          role: 'switch',
          'aria-checked': String(isDark.value),
          'aria-label': isDark.value
            ? 'Switch to light theme'
            : 'Switch to dark theme',
          disabled: props.disabled,
          ...withTooltipAttrs(
            ['nebula-theme-toggle', isDark.value && 'nebula-theme-toggle--dark']
              .filter(Boolean)
              .join(' '),
            props.class,
            props.tooltip,
            props.tooltipPlacement,
          ),
          onClick: toggleTheme,
        },
        [
          h('span', { class: 'nebula-theme-toggle__track' }, [
            h('span', { class: 'nebula-theme-toggle__thumb' }, [
              h('span', {
                class: [
                  'nebula-theme-toggle__icon',
                  isDark.value
                    ? 'nebula-theme-toggle__icon--moon'
                    : 'nebula-theme-toggle__icon--sun',
                ],
                'aria-hidden': 'true',
              }),
            ]),
          ]),
        ],
      );
  },
});
