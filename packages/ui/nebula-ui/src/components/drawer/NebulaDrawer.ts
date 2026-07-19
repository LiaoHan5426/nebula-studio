import { computed, defineComponent, h, ref, Teleport } from 'vue';
import { cn } from '../../utils/cn';
import NebulaButton from '../button/NebulaButton.vue';
import { useBodyScrollLock } from '../../composables/useBodyScrollLock';
import { useOverlayDismiss } from '../../composables/useOverlayDismiss';

export const NebulaDrawer = defineComponent({
  name: 'NebulaDrawer',
  props: {
    open: {
      type: Boolean,
      default: undefined,
    },
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    width: {
      type: String,
      default: '380px',
    },
    placement: {
      type: String as () => 'right' | 'left',
      default: 'right',
    },
    class: {
      type: String,
      default: '',
    },
  },
  emits: ['update:open', 'close'],
  setup(props, { slots, emit }) {
    const internalOpen = ref(false);
    const isOpen = computed({
      get: () => props.open ?? internalOpen.value,
      set: (value: boolean) => {
        internalOpen.value = value;
        emit('update:open', value);
      },
    });

    const close = () => {
      isOpen.value = false;
      emit('close');
    };

    useBodyScrollLock(() => isOpen.value);
    useOverlayDismiss({ isOpen: () => isOpen.value, onDismiss: close });

    return () => {
      if (!isOpen.value) return null;
      return h(Teleport, { to: 'body' }, [
        h('div', { class: cn('nebula-drawer-root', props.class) }, [
          h('div', {
            class: 'nebula-drawer__overlay',
            onClick: close,
          }),
          h(
            'aside',
            {
              class: cn('nebula-drawer', `nebula-drawer--${props.placement}`),
              style: { width: props.width },
              role: 'dialog',
              'aria-modal': 'true',
              'aria-label': props.title || 'Drawer',
            },
            [
              (props.title || props.subtitle || slots.header) &&
                h('header', { class: 'nebula-drawer__header' }, [
                  slots.header?.() ?? [
                    h('div', { class: 'nebula-drawer__titles' }, [
                      props.title &&
                        h('h2', { class: 'nebula-drawer__title' }, props.title),
                      props.subtitle &&
                        h(
                          'p',
                          { class: 'nebula-drawer__subtitle' },
                          props.subtitle,
                        ),
                    ]),
                  ],
                  h(
                    NebulaButton,
                    {
                      icon: true,
                      variant: 'ghost',
                      class: 'nebula-drawer__close',
                      title: '关闭',
                      ariaLabel: '关闭',
                      onClick: close,
                    },
                    () =>
                      h(
                        'svg',
                        {
                          viewBox: '0 0 24 24',
                          fill: 'none',
                          stroke: 'currentColor',
                          'stroke-width': '2',
                          width: '18',
                          height: '18',
                          'aria-hidden': 'true',
                        },
                        [
                          h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
                          h('line', { x1: '6', y1: '6', x2: '18', y2: '18' }),
                        ],
                      ),
                  ),
                ]),
              h('div', { class: 'nebula-drawer__body' }, slots.default?.()),
              slots.footer &&
                h('footer', { class: 'nebula-drawer__footer' }, slots.footer()),
            ],
          ),
        ]),
      ]);
    };
  },
});
