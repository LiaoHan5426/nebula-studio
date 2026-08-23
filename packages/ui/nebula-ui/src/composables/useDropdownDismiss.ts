import type { Ref } from 'vue';

import { onMounted, onUnmounted } from 'vue';

export interface UseDropdownDismissOptions {
  /** 点击菜单/触发器以外区域时关闭。默认 true。 */
  closeOnOutside?: () => boolean;
  menuRef: Ref<HTMLElement | null>;
  onClose: () => void;
  open: () => boolean;
  triggerRef: Ref<HTMLElement | null>;
}

/**
 * 下拉/弹出层关闭：默认点击空白关闭，并处理 iframe 抢焦点与 Escape。
 */
export function useDropdownDismiss(options: UseDropdownDismissOptions) {
  const { triggerRef, menuRef, open, onClose } = options;

  function closeOnOutsideEnabled(): boolean {
    return options.closeOnOutside?.() !== false;
  }

  function isInside(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) return false;
    if (triggerRef.value?.contains(target)) return true;
    if (menuRef.value?.contains(target)) return true;
    return false;
  }

  function dismissIfOutside(target: EventTarget | null): void {
    if (!open() || !closeOnOutsideEnabled()) return;
    if (isInside(target)) return;
    onClose();
  }

  function onPointerDown(event: PointerEvent): void {
    dismissIfOutside(event.target);
  }

  function onWindowBlur(): void {
    if (!open() || !closeOnOutsideEnabled()) return;
    onClose();
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && open()) onClose();
  }

  onMounted(() => {
    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('keydown', onKeydown);
  });

  onUnmounted(() => {
    document.removeEventListener('pointerdown', onPointerDown, true);
    window.removeEventListener('blur', onWindowBlur);
    document.removeEventListener('keydown', onKeydown);
  });
}
