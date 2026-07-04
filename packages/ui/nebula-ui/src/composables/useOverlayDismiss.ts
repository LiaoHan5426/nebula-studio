import { onMounted, onUnmounted } from 'vue';

export interface UseOverlayDismissOptions {
  isOpen: () => boolean;
  onDismiss: () => void;
}

/**
 * Overlay 关闭 composable。
 *
 * 处理 Escape 键盘关闭。可与 overlay 点击关闭组合使用。
 */
export function useOverlayDismiss(options: UseOverlayDismissOptions) {
  const { isOpen, onDismiss } = options;

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && isOpen()) onDismiss();
  }

  onMounted(() => document.addEventListener('keydown', onKeydown));
  onUnmounted(() => document.removeEventListener('keydown', onKeydown));
}
