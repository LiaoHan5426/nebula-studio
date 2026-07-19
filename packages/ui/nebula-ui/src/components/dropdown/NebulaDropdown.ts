import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  ref,
  Teleport,
} from 'vue';
import type { InjectionKey } from 'vue';
import { cn } from '../../utils/cn';
import { useDropdownPosition } from '../../composables/useDropdownPosition';
import { useDropdownDismiss } from '../../composables/useDropdownDismiss';

const dropdownCloseKey: InjectionKey<() => void> = Symbol(
  'nebula-dropdown-close',
);

export const NebulaDropdown = defineComponent({
  name: 'NebulaDropdown',
  props: {
    open: {
      type: Boolean,
      default: undefined,
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
    const internalOpen = ref(false);
    const isOpen = computed({
      get: () => props.open ?? internalOpen.value,
      set: (value: boolean) => {
        internalOpen.value = value;
        emit('update:open', value);
      },
    });

    const close = () => {
      if (isOpen.value) isOpen.value = false;
    };

    provide(dropdownCloseKey, close);

    const toggle = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      isOpen.value = !isOpen.value;
    };

    const { menuStyle } = useDropdownPosition({
      triggerRef,
      open: () => isOpen.value,
      placement: () => props.placement,
      offset: () => props.offset,
    });

    useDropdownDismiss({
      triggerRef,
      menuRef,
      open: () => isOpen.value,
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
            onKeydown: (event: KeyboardEvent) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                isOpen.value = !isOpen.value;
              }
            },
          },
          slots.trigger?.(),
        ),
        isOpen.value &&
          h(Teleport, { to: 'body' }, [
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
          ]),
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
    const closeDropdown = inject(dropdownCloseKey, () => undefined);
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
            closeDropdown();
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
