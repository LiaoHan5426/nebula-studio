import { onMounted, onUnmounted, nextTick } from 'vue';

type ScrollRoot = Window | HTMLElement;

function getScrollMetrics(root: ScrollRoot): {
  scrollTop: number;
  clientHeight: number;
  scrollHeight: number;
} {
  if (root === window) {
    const scrollTop =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;
    return {
      scrollTop,
      clientHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
    };
  }
  const el = root as HTMLElement;
  return {
    scrollTop: el.scrollTop,
    clientHeight: el.clientHeight,
    scrollHeight: el.scrollHeight,
  };
}

function sectionScrollTop(
  section: HTMLElement,
  scrollRoot: ScrollRoot,
): number {
  if (scrollRoot === window) {
    return section.getBoundingClientRect().top + window.scrollY;
  }
  const root = scrollRoot as HTMLElement;
  const sr = section.getBoundingClientRect();
  const rr = root.getBoundingClientRect();
  return root.scrollTop + (sr.top - rr.top);
}

export interface UseScrollSpyOptions {
  items: () => { id: string; label: string }[];
  trackScroll: () => boolean;
  scrollRoot: () => string;
  activationViewportRatio: () => number;
  scrollBottomSlack: () => number;
  onActivate: (id: string) => void;
}

/**
 * 滚动跟踪高亮 composable。
 *
 * 根据滚动位置计算当前可见的区块，并回调 onActivate 通知父组件。
 */
export function useScrollSpy(options: UseScrollSpyOptions) {
  const {
    items,
    trackScroll,
    scrollRoot,
    activationViewportRatio,
    scrollBottomSlack,
    onActivate,
  } = options;

  let scrollRootEl: ScrollRoot = window;
  let scrollHandler: (() => void) | null = null;

  function resolveScrollRoot(): ScrollRoot {
    const selector = scrollRoot();
    if (selector) {
      const el = document.querySelector(selector);
      if (el instanceof HTMLElement) return el;
    }
    return window;
  }

  function syncActiveAnchor(): void {
    if (!trackScroll() || items().length === 0) return;

    const root = scrollRootEl;
    const { scrollTop, clientHeight, scrollHeight } = getScrollMetrics(root);
    const allItems = items();
    const lastDef = allItems[allItems.length - 1];

    if (
      lastDef &&
      scrollTop + clientHeight >= scrollHeight - scrollBottomSlack()
    ) {
      onActivate(lastDef.id);
      return;
    }

    const ratio = Math.min(0.48, Math.max(0.06, activationViewportRatio()));
    const lineY = scrollTop + clientHeight * ratio;

    let chosen = allItems[0]?.id ?? '';
    for (const item of allItems) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      const top = sectionScrollTop(el, root);
      if (top <= lineY) {
        chosen = item.id;
      }
    }
    onActivate(chosen);
  }

  function attachScrollListener(): void {
    detachScrollListener();
    scrollRootEl = resolveScrollRoot();

    if (!trackScroll() || items().length === 0) return;

    scrollHandler = syncActiveAnchor;
    if (scrollRootEl === window) {
      window.addEventListener('scroll', scrollHandler, { passive: true });
    } else {
      scrollRootEl.addEventListener('scroll', scrollHandler, { passive: true });
    }
    syncActiveAnchor();
  }

  function detachScrollListener(): void {
    if (!scrollHandler) return;
    if (scrollRootEl === window) {
      window.removeEventListener('scroll', scrollHandler);
    } else {
      scrollRootEl.removeEventListener('scroll', scrollHandler);
    }
    scrollHandler = null;
    scrollRootEl = window;
  }

  function reattach(): void {
    void nextTick(() => {
      detachScrollListener();
      attachScrollListener();
    });
  }

  onMounted(() => attachScrollListener());
  onUnmounted(() => detachScrollListener());

  return {
    attachScrollListener,
    detachScrollListener,
    reattach,
    syncActiveAnchor,
  };
}
