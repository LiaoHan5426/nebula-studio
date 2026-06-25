import { watch, onUnmounted } from 'vue';

/**
 * Body 滚动锁定 composable。
 *
 * 当 overlay/drawer 打开时锁定 body 滚动，关闭时恢复。
 * 组件卸载时自动解锁。
 */
export function useBodyScrollLock(isOpen: () => boolean) {
  function lockBody(locked: boolean): void {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = locked ? 'hidden' : '';
  }

  watch(isOpen, (open) => lockBody(open), { immediate: true });

  onUnmounted(() => lockBody(false));

  return { lockBody };
}
