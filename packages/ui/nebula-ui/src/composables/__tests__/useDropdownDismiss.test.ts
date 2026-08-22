import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';

import { describe, expect, it, vi } from 'vitest';

import { useDropdownDismiss } from '../useDropdownDismiss';

function mountDismiss(open = true, closeOnOutside?: () => boolean) {
  const onClose = vi.fn();
  const Host = defineComponent({
    setup() {
      const triggerRef = ref<HTMLElement | null>(null);
      const menuRef = ref<HTMLElement | null>(null);
      const isOpen = ref(open);
      useDropdownDismiss({
        triggerRef,
        menuRef,
        open: () => isOpen.value,
        onClose,
        closeOnOutside,
      });
      return { triggerRef, menuRef };
    },
    template:
      '<div><button class="dd-trigger" ref="triggerRef" type="button">t</button><div class="dd-menu" ref="menuRef">menu</div></div>',
  });
  const wrapper = mount(Host, { attachTo: document.body });
  return { wrapper, onClose };
}

describe('useDropdownDismiss', () => {
  it('closes on pointerdown outside the menu and trigger', async () => {
    const { wrapper, onClose } = mountDismiss();
    await nextTick();
    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it('does not close when pointerdown is inside the menu', async () => {
    const { wrapper, onClose } = mountDismiss();
    await nextTick();
    wrapper
      .get('.dd-menu')
      .element.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true }),
      );
    expect(onClose).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('closes when the window blurs (iframe / other document)', async () => {
    const { wrapper, onClose } = mountDismiss();
    await nextTick();
    window.dispatchEvent(new Event('blur'));
    expect(onClose).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it('keeps the menu open when closeOnOutside is false', async () => {
    const { wrapper, onClose } = mountDismiss(true, () => false);
    await nextTick();
    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    window.dispatchEvent(new Event('blur'));
    expect(onClose).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
