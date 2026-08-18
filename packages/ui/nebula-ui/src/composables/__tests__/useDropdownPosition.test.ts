import { defineComponent, h, nextTick, ref } from 'vue';

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { useDropdownPosition } from '../useDropdownPosition';

function stubRect(
  el: HTMLElement,
  rect: Pick<DOMRect, 'bottom' | 'height' | 'left' | 'right' | 'top' | 'width'>,
): void {
  el.getBoundingClientRect = () =>
    ({
      x: rect.left,
      y: rect.top,
      ...rect,
      toJSON: () => rect,
    }) as DOMRect;
}

describe('useDropdownPosition', () => {
  it('flips the menu upward when there is not enough space below', async () => {
    const Host = defineComponent({
      setup() {
        const triggerRef = ref<HTMLElement | null>(null);
        const menuRef = ref<HTMLElement | null>(null);
        const isOpen = ref(true);
        const { menuStyle, updatePosition } = useDropdownPosition({
          triggerRef,
          menuRef,
          open: () => isOpen.value,
          placement: () => 'bottom-start',
          offset: () => 8,
          matchTriggerWidth: () => true,
        });

        return {
          triggerRef,
          menuRef,
          menuStyle,
          updatePosition,
        };
      },
      render() {
        return h('div', [
          h('button', { ref: 'triggerRef' }, 'open'),
          h(
            'div',
            { ref: 'menuRef', class: 'dropdown-menu', style: this.menuStyle },
            'menu',
          ),
        ]);
      },
    });

    const wrapper = mount(Host, { attachTo: document.body });
    const trigger = wrapper.get('button').element;
    const menu = wrapper.get('.dropdown-menu').element;

    stubRect(trigger, {
      top: 700,
      bottom: 736,
      left: 16,
      right: 216,
      width: 200,
      height: 36,
    });
    Object.defineProperty(menu, 'offsetHeight', {
      configurable: true,
      value: 280,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 768,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1280,
    });

    (wrapper.vm as unknown as { updatePosition: () => void }).updatePosition();
    await nextTick();

    const top = Number.parseFloat((menu as HTMLElement).style.top);
    expect(top).toBeLessThan(700);
    expect((menu as HTMLElement).style.maxHeight).not.toBe('');
    expect((menu as HTMLElement).style.zIndex).toBe('var(--z-popover)');
    wrapper.unmount();
  });
});
