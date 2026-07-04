import { onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';

export interface UseDropdownDismissOptions {
  triggerRef: Ref<HTMLElement | null>;
  menuRef: Ref<HTMLElement | null>;
  open: () => boolean;
  onClose: () => void;
}

/**
 * Dropdown 关闭 composable。
 *
 * 处理文档点击关闭（click outside）和 Escape 键盘关闭。
 */
export function useDropdownDismiss(options: UseDropdownDismissOptions) {
  const { triggerRef, menuRef, open, onClose } = options;

  function onDocClick(event: MouseEvent): void {
    if (!open()) return;
    const target = event.target as Node;
    if (triggerRef.value?.contains(target)) return;
    if (menuRef.value?.contains(target)) return;
    onClose();
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') onClose();
  }

  onMounted(() => {
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeydown);
  });

  onUnmounted(() => {
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('keydown', onKeydown);
  });
}
