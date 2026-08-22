import { onMounted, onUnmounted } from 'vue';

export interface UseOverlayDismissOptions {
  isOpen: () => boolean;
  onDismiss: () => void;
  /** Escape 关闭。默认 true。 */
  closeOnEscape?: () => boolean;
}

/**
 * Overlay 键盘关闭。遮罩点击由 Dialog/Drawer 各自用 closeOnOverlay 控制。
 */
export function useOverlayDismiss(options: UseOverlayDismissOptions) {
  const { isOpen, onDismiss } = options;

  function onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (!isOpen()) return;
    if (options.closeOnEscape?.() === false) return;
    onDismiss();
  }

  onMounted(() => document.addEventListener('keydown', onKeydown));
  onUnmounted(() => document.removeEventListener('keydown', onKeydown));
}
