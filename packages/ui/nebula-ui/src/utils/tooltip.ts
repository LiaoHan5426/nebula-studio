import { cn } from './cn';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';
export type ResolvedTooltipPlacement = Exclude<TooltipPlacement, 'auto'>;

const TOOLTIP_OFFSET = 10;
const VIEWPORT_PADDING = 8;

type FloatingTooltipState = {
  root: HTMLDivElement;
  arrow: HTMLDivElement;
};
type ActiveTooltipState = {
  target: HTMLElement;
  content: string;
  preferred: TooltipPlacement;
};

let floatingTooltipState: FloatingTooltipState | null = null;
let activeTooltipState: ActiveTooltipState | null = null;
let autoUpdateFrameId: number | null = null;
let listenersBound = false;
let hideTimerId: number | null = null;
let closeAnimationTimerId: number | null = null;

function updateFloatingTooltipPosition(): void {
  if (!activeTooltipState || typeof window === 'undefined') return;
  const { target, content, preferred } = activeTooltipState;
  if (!target.isConnected) {
    hideFloatingTooltip();
    return;
  }
  const state = ensureFloatingTooltip();
  const placement = resolveTooltipPlacement(target, content, preferred);
  state.root.dataset.placement = placement;
  const size = state.root.getBoundingClientRect();
  const pos = getTooltipPosition(target, placement, {
    width: size.width,
    height: size.height,
  });
  state.root.style.left = `${Math.round(pos.left)}px`;
  state.root.style.top = `${Math.round(pos.top)}px`;
}

const handleWindowChange = (): void => {
  updateFloatingTooltipPosition();
};

function ensureFloatingTooltip(): FloatingTooltipState {
  if (floatingTooltipState) return floatingTooltipState;
  const root = document.createElement('div');
  root.className = 'nebula-floating-tooltip';
  const arrow = document.createElement('div');
  arrow.className = 'nebula-floating-tooltip__arrow';
  root.appendChild(arrow);
  document.body.appendChild(root);
  floatingTooltipState = { root, arrow };
  return floatingTooltipState;
}

function measureTooltipSize(content: string): {
  width: number;
  height: number;
} {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { width: 220, height: 36 };
  }
  const measureNode = document.createElement('div');
  measureNode.className = 'nebula-floating-tooltip';
  measureNode.dataset.open = 'true';
  measureNode.style.left = '-9999px';
  measureNode.style.top = '-9999px';
  measureNode.style.visibility = 'hidden';
  measureNode.textContent = content;
  const arrow = document.createElement('div');
  arrow.className = 'nebula-floating-tooltip__arrow';
  measureNode.appendChild(arrow);
  document.body.appendChild(measureNode);
  const rect = measureNode.getBoundingClientRect();
  document.body.removeChild(measureNode);
  return { width: rect.width, height: rect.height };
}

function getPlacementCandidates(
  preferred: TooltipPlacement,
): ResolvedTooltipPlacement[] {
  if (preferred === 'auto') return ['top', 'bottom', 'right', 'left'];
  if (preferred === 'top') return ['top', 'left', 'right', 'bottom'];
  if (preferred === 'bottom') return ['bottom', 'left', 'right', 'top'];
  if (preferred === 'left') return ['left', 'right', 'top', 'bottom'];
  return ['right', 'left', 'top', 'bottom'];
}

export function resolveTooltipPlacement(
  target: HTMLElement,
  content: string,
  preferred: TooltipPlacement = 'top',
): ResolvedTooltipPlacement {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    !target?.getBoundingClientRect
  ) {
    return preferred === 'auto' ? 'top' : preferred;
  }

  const rect = target.getBoundingClientRect();
  const tooltip = measureTooltipSize(content);
  const spaces = {
    top: rect.top,
    bottom: window.innerHeight - rect.bottom,
    left: rect.left,
    right: window.innerWidth - rect.right,
  };
  const required = {
    top: tooltip.height + 14,
    bottom: tooltip.height + 14,
    left: tooltip.width + 14,
    right: tooltip.width + 14,
  };

  for (const placement of getPlacementCandidates(preferred)) {
    if (spaces[placement] >= required[placement]) return placement;
  }

  const fallback = getPlacementCandidates(preferred).toSorted(
    (a, b) => spaces[b] - spaces[a],
  )[0];
  return fallback ?? 'top';
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

function getTooltipPosition(
  target: HTMLElement,
  placement: ResolvedTooltipPlacement,
  tooltipSize: { width: number; height: number },
): { left: number; top: number } {
  const rect = target.getBoundingClientRect();
  const leftCenter = rect.left + rect.width / 2 - tooltipSize.width / 2;
  const topCenter = rect.top + rect.height / 2 - tooltipSize.height / 2;

  if (placement === 'top') {
    return {
      left: clamp(
        leftCenter,
        VIEWPORT_PADDING,
        window.innerWidth - tooltipSize.width - VIEWPORT_PADDING,
      ),
      top: clamp(
        rect.top - tooltipSize.height - TOOLTIP_OFFSET,
        VIEWPORT_PADDING,
        window.innerHeight - tooltipSize.height - VIEWPORT_PADDING,
      ),
    };
  }
  if (placement === 'bottom') {
    return {
      left: clamp(
        leftCenter,
        VIEWPORT_PADDING,
        window.innerWidth - tooltipSize.width - VIEWPORT_PADDING,
      ),
      top: clamp(
        rect.bottom + TOOLTIP_OFFSET,
        VIEWPORT_PADDING,
        window.innerHeight - tooltipSize.height - VIEWPORT_PADDING,
      ),
    };
  }
  if (placement === 'left') {
    return {
      left: clamp(
        rect.left - tooltipSize.width - TOOLTIP_OFFSET,
        VIEWPORT_PADDING,
        window.innerWidth - tooltipSize.width - VIEWPORT_PADDING,
      ),
      top: clamp(
        topCenter,
        VIEWPORT_PADDING,
        window.innerHeight - tooltipSize.height - VIEWPORT_PADDING,
      ),
    };
  }
  return {
    left: clamp(
      rect.right + TOOLTIP_OFFSET,
      VIEWPORT_PADDING,
      window.innerWidth - tooltipSize.width - VIEWPORT_PADDING,
    ),
    top: clamp(
      topCenter,
      VIEWPORT_PADDING,
      window.innerHeight - tooltipSize.height - VIEWPORT_PADDING,
    ),
  };
}

function bindWindowListeners(): void {
  if (listenersBound) return;
  window.addEventListener('resize', handleWindowChange, { passive: true });
  window.addEventListener('scroll', handleWindowChange, {
    passive: true,
    capture: true,
  });
  listenersBound = true;
}

function unbindWindowListeners(): void {
  if (!listenersBound) return;
  window.removeEventListener('resize', handleWindowChange);
  window.removeEventListener('scroll', handleWindowChange, true);
  listenersBound = false;
}

function startAutoUpdateLoop(): void {
  if (autoUpdateFrameId !== null) return;
  const tick = (): void => {
    if (!activeTooltipState) {
      autoUpdateFrameId = null;
      return;
    }
    updateFloatingTooltipPosition();
    autoUpdateFrameId = window.requestAnimationFrame(tick);
  };
  autoUpdateFrameId = window.requestAnimationFrame(tick);
}

function stopAutoUpdateLoop(): void {
  if (autoUpdateFrameId === null) return;
  window.cancelAnimationFrame(autoUpdateFrameId);
  autoUpdateFrameId = null;
}

function cancelScheduledHide(): void {
  if (hideTimerId === null) return;
  window.clearTimeout(hideTimerId);
  hideTimerId = null;
}

function cancelCloseAnimationTimer(): void {
  if (closeAnimationTimerId === null) return;
  window.clearTimeout(closeAnimationTimerId);
  closeAnimationTimerId = null;
}

function triggerPopAnimation(root: HTMLElement): void {
  root.classList.remove('nebula-floating-tooltip--pop');
  void root.offsetWidth;
  root.classList.add('nebula-floating-tooltip--pop');
}

export function showFloatingTooltip(
  target: HTMLElement,
  content: string,
  preferred: TooltipPlacement = 'top',
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const normalized = content.trim();
  if (!normalized) return;
  cancelScheduledHide();
  cancelCloseAnimationTimer();
  const state = ensureFloatingTooltip();
  state.root.classList.remove('nebula-floating-tooltip--closing');
  const wasOpen = state.root.dataset.open === 'true';
  state.root.dataset.switching = wasOpen ? 'true' : 'false';
  state.root.textContent = normalized;
  state.root.appendChild(state.arrow);
  activeTooltipState = { target, content: normalized, preferred };
  bindWindowListeners();
  updateFloatingTooltipPosition();
  startAutoUpdateLoop();
  state.root.dataset.open = 'true';
  triggerPopAnimation(state.root);
  if (wasOpen) {
    window.requestAnimationFrame(() => {
      if (!floatingTooltipState) return;
      floatingTooltipState.root.dataset.switching = 'false';
    });
  }
}

export function hideFloatingTooltip(): void {
  if (!floatingTooltipState) return;
  cancelScheduledHide();
  cancelCloseAnimationTimer();
  activeTooltipState = null;
  stopAutoUpdateLoop();
  unbindWindowListeners();
  const root = floatingTooltipState.root;
  if (root.dataset.open !== 'true') return;
  root.classList.remove('nebula-floating-tooltip--pop');
  root.dataset.switching = 'false';
  root.classList.add('nebula-floating-tooltip--closing');
  closeAnimationTimerId = window.setTimeout(() => {
    if (!floatingTooltipState) return;
    floatingTooltipState.root.dataset.open = 'false';
    floatingTooltipState.root.dataset.switching = 'false';
    floatingTooltipState.root.classList.remove(
      'nebula-floating-tooltip--closing',
    );
    closeAnimationTimerId = null;
  }, 110);
}

export function hideFloatingTooltipByTarget(target: HTMLElement): void {
  if (!activeTooltipState) return;
  if (activeTooltipState.target !== target) return;
  hideFloatingTooltip();
}

export function scheduleHideFloatingTooltipByTarget(
  target: HTMLElement,
  delayMs = 120,
): void {
  if (!activeTooltipState) return;
  if (activeTooltipState.target !== target) return;
  cancelScheduledHide();
  hideTimerId = window.setTimeout(() => {
    if (!activeTooltipState) return;
    if (activeTooltipState.target !== target) return;
    hideFloatingTooltip();
  }, delayMs);
}

export function withTooltipAttrs(
  baseClass: string,
  extraClass: string,
  tooltip?: string,
  placement: TooltipPlacement = 'top',
) {
  const normalizedTooltip = tooltip?.trim() ?? '';
  const hasTooltip = normalizedTooltip.length > 0;
  return {
    class: cn(baseClass, hasTooltip && 'nebula-has-tooltip', extraClass),
    ...(hasTooltip
      ? {
          'data-nebula-tooltip-enabled': 'true',
          onMouseenter: (event: MouseEvent) => {
            const el = event.currentTarget as HTMLElement | null;
            if (!el) return;
            showFloatingTooltip(el, normalizedTooltip, placement);
          },
          onMouseleave: (event: MouseEvent) => {
            const el = event.currentTarget as HTMLElement | null;
            if (!el) return;
            scheduleHideFloatingTooltipByTarget(el);
          },
          onFocus: (event: FocusEvent) => {
            const el = event.currentTarget as HTMLElement | null;
            if (!el) return;
            showFloatingTooltip(el, normalizedTooltip, placement);
          },
          onBlur: (event: FocusEvent) => {
            const el = event.currentTarget as HTMLElement | null;
            if (!el) return;
            scheduleHideFloatingTooltipByTarget(el);
          },
        }
      : {}),
  };
}
