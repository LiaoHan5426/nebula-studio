import { defineComponent, h, ref, Teleport } from 'vue';
import { cn } from '../../utils/cn';
import { useDropdownPosition } from '../../composables/useDropdownPosition';
import { useDropdownDismiss } from '../../composables/useDropdownDismiss';

export const NebulaDropdown = defineComponent({
  name: 'NebulaDropdown',
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    placement: {
      type: String as () => 'bottom-end' | 'bottom-start',
      default: 'bottom-end',
    },
    class: {
      type: String,
      default: '',
    },
    menuClass: {
      type: String,
      default: '',
    },
    offset: {
      type: Number,
      default: 8,
    },
  },
  emits: ['update:open'],
  setup(props, { slots, emit }) {
    const triggerRef = ref<HTMLElement | null>(null);
    const menuRef = ref<HTMLElement | null>(null);

    const close = () => {
      if (props.open) emit('update:open', false);
    };

    const toggle = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      emit('update:open', !props.open);
    };

    const { menuStyle } = useDropdownPosition({
      triggerRef,
      open: () => props.open,
      placement: () => props.placement,
      offset: () => props.offset,
    });

    useDropdownDismiss({
      triggerRef,
      menuRef,
      open: () => props.open,
      onClose: close,
    });

    return () =>
      h('div', { class: cn('nebula-dropdown', props.class) }, [
        h(
          'div',
          {
            ref: triggerRef,
            class: 'nebula-dropdown__trigger',
            onClick: toggle,
          },
          slots.trigger?.(),
        ),
        props.open &&
          h(Teleport, { to: 'body' }, () =>
            h(
              'div',
              {
                ref: menuRef,
                class: cn('nebula-dropdown__menu', 'is-open', props.menuClass),
                style: menuStyle.value,
                role: 'menu',
                onMousedown: (event: MouseEvent) => event.stopPropagation(),
              },
              slots.default?.(),
            ),
          ),
      ]);
  },
});

export const NebulaDropdownItem = defineComponent({
  name: 'NebulaDropdownItem',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    shortcut: {
      type: String,
      default: '',
    },
    class: {
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
          type: 'button',
          role: 'menuitem',
          disabled: props.disabled,
          class: cn('nebula-dropdown__item', props.class),
          onClick: (event: MouseEvent) => {
            if (props.disabled) return;
            emit('click', event);
          },
          onMouseup: (event: MouseEvent) => {
            event.stopPropagation();
          },
        },
        [
          h('span', { class: 'nebula-dropdown__item-main' }, slots.default?.()),
          props.shortcut &&
            h(
              'span',
              { class: 'nebula-dropdown__item-shortcut' },
              props.shortcut,
            ),
        ],
      );
  },
});

export const NebulaDropdownDivider = defineComponent({
  name: 'NebulaDropdownDivider',
  setup() {
    return () =>
      h('div', {
        class: 'nebula-dropdown__divider',
        role: 'separator',
      });
  },
});
