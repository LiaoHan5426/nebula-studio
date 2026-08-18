import type { Ref } from 'vue';

import { onMounted, onUnmounted, ref, watch } from 'vue';

const VIEWPORT_PAD = 8;

export interface UseDropdownPositionOptions {
  matchTriggerWidth?: () => boolean;
  menuRef?: Ref<HTMLElement | null | undefined>;
  offset: () => number;
  open: () => boolean;
  placement: () => 'bottom-end' | 'bottom-start';
  triggerRef: Ref<HTMLElement | null | undefined>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * 将浮层固定到 trigger，并在视口不足时翻转到上方、限制最大高度，避免菜单被裁切或挡到内容。
 */
export function useDropdownPosition(options: UseDropdownPositionOptions) {
  const { triggerRef, open, placement, offset, menuRef, matchTriggerWidth } =
    options;
  const menuStyle = ref<Record<string, string>>({});

  function updatePosition(): void {
    const el = triggerRef.value;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const gap = offset();
    const menuEl = menuRef?.value;
    const menuHeight = menuEl?.offsetHeight || 280;
    const menuWidth = matchTriggerWidth?.()
      ? rect.width
      : (menuEl?.offsetWidth ?? Math.max(rect.width, 180));

    const spaceBelow = window.innerHeight - rect.bottom - gap - VIEWPORT_PAD;
    const spaceAbove = rect.top - gap - VIEWPORT_PAD;
    const openUpward =
      spaceBelow < Math.min(menuHeight, 160) && spaceAbove > spaceBelow;
    const available = Math.max(120, openUpward ? spaceAbove : spaceBelow);

    const top = openUpward
      ? clamp(
          rect.top - gap - Math.min(menuHeight, available),
          VIEWPORT_PAD,
          window.innerHeight - VIEWPORT_PAD,
        )
      : rect.bottom + gap;

    const style: Record<string, string> = {
      position: 'fixed',
      top: `${top}px`,
      zIndex: 'var(--z-popover)',
      maxHeight: `${available}px`,
      overflowY: 'auto',
    };

    if (matchTriggerWidth?.()) {
      style.width = `${rect.width}px`;
      style.minWidth = `${rect.width}px`;
    }

    if (placement() === 'bottom-start') {
      const maxLeft = window.innerWidth - VIEWPORT_PAD - menuWidth;
      style.left = `${clamp(rect.left, VIEWPORT_PAD, Math.max(VIEWPORT_PAD, maxLeft))}px`;
    } else {
      const preferredRight = window.innerWidth - rect.right;
      const maxRight = window.innerWidth - menuWidth - VIEWPORT_PAD;
      style.right = `${clamp(preferredRight, VIEWPORT_PAD, Math.max(VIEWPORT_PAD, maxRight))}px`;
    }

    menuStyle.value = style;
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
