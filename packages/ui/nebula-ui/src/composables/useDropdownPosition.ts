import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { Ref } from 'vue';

export interface UseDropdownPositionOptions {
  triggerRef: Ref<HTMLElement | null>;
  open: () => boolean;
  placement: () => 'bottom-end' | 'bottom-start';
  offset: () => number;
}

/**
 * Dropdown 定位 composable。
 *
 * 根据 trigger 元素的位置计算菜单的 fixed 定位样式，
 * 并在 scroll/resize 时自动更新。
 */
export function useDropdownPosition(options: UseDropdownPositionOptions) {
  const { triggerRef, open, placement, offset } = options;
  const menuStyle = ref<Record<string, string>>({});

  function updatePosition(): void {
    const el = triggerRef.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = rect.bottom + offset();
    if (placement() === 'bottom-start') {
      menuStyle.value = {
        position: 'fixed',
        top: `${top}px`,
        left: `${rect.left}px`,
        zIndex: '99990',
      };
    } else {
      menuStyle.value = {
        position: 'fixed',
        top: `${top}px`,
        right: `${window.innerWidth - rect.right}px`,
        zIndex: '99990',
      };
    }
  }

  onMounted(() => {
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updatePosition);
    window.removeEventListener('scroll', updatePosition, true);
  });

  watch(open, (isOpen) => {
    if (isOpen) {
      updatePosition();
      requestAnimationFrame(updatePosition);
    }
  });

  return { menuStyle, updatePosition };
}
