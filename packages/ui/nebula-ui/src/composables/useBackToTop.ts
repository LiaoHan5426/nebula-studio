import { ref } from 'vue';

export interface UseBackToTopOptions {
  enabled: () => boolean;
  mode: () => 'inline' | 'float';
  threshold: () => number;
  behavior: () => ScrollBehavior;
  scrollRoot: () => string;
}

type ScrollRoot = Window | HTMLElement;

function getScrollTop(root: ScrollRoot): number {
  if (root === window) {
    return (
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop
    );
  }
  return (root as HTMLElement).scrollTop;
}

/**
 * 回到顶部 composable。
 *
 * 管理浮动回到顶部按钮的可见性，并提供 scrollToTop 方法。
 */
export function useBackToTop(options: UseBackToTopOptions) {
  const { enabled, mode, threshold, behavior, scrollRoot } = options;
  const visible = ref(false);

  let scrollRootEl: ScrollRoot = window;
  let handler: (() => void) | null = null;

  function resolveScrollRoot(): ScrollRoot {
    const selector = scrollRoot();
    if (selector) {
      const el = document.querySelector(selector);
      if (el instanceof HTMLElement) return el;
    }
    return window;
  }

  function update(): void {
    if (!enabled() || mode() !== 'float') return;
    scrollRootEl = resolveScrollRoot();
    visible.value = getScrollTop(scrollRootEl) > threshold();
  }

  function scrollToTop(): void {
    const target = scrollRoot() ? document.querySelector(scrollRoot()) : null;
    if (target instanceof HTMLElement) {
      target.scrollTo({ top: 0, behavior: behavior() });
    } else {
      window.scrollTo({ top: 0, behavior: behavior() });
    }
  }

  function attach(): void {
    detach();
    if (!enabled() || mode() !== 'float') return;
    scrollRootEl = resolveScrollRoot();
    handler = update;
    if (scrollRootEl === window) {
      window.addEventListener('scroll', handler, { passive: true });
    } else {
      scrollRootEl.addEventListener('scroll', handler, { passive: true });
    }
    update();
  }

  function detach(): void {
    if (!handler) return;
    if (scrollRootEl === window) {
      window.removeEventListener('scroll', handler);
    } else {
      scrollRootEl.removeEventListener('scroll', handler);
    }
    handler = null;
    scrollRootEl = window;
  }

  return { visible, update, scrollToTop, attach, detach };
}
