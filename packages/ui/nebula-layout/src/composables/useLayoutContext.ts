import { inject, provide, computed, ref } from 'vue';
import type { ComputedRef, InjectionKey, Ref } from 'vue';

export interface LayoutSidebarState {
  collapsed: Ref<boolean>;
  pinned: Ref<boolean>;
  expandOnHover: Ref<boolean>;
  hoverExpanded: Ref<boolean>;
  effectiveExpanded: ComputedRef<boolean>;
  toggleCollapsed: () => void;
  togglePinned: () => void;
  onSidebarEnter: () => void;
  onSidebarLeave: () => void;
}

export interface LayoutContext {
  mode: 'shell' | 'admin' | 'content';
  sidebar: LayoutSidebarState;
}

const layoutContextKey: InjectionKey<LayoutContext> = Symbol('nebula-layout');

export function provideLayoutContext(ctx: LayoutContext): void {
  provide(layoutContextKey, ctx);
}

export function useLayoutContext(): LayoutContext {
  const ctx = inject(layoutContextKey);
  if (!ctx) {
    throw new Error('useLayoutContext must be used within a layout provider.');
  }
  return ctx;
}

export function tryUseLayoutContext(): LayoutContext | null {
  return inject(layoutContextKey, null);
}

export function createSidebarState(options: {
  collapsed: Ref<boolean>;
  pinned: Ref<boolean>;
  expandOnHover: Ref<boolean>;
}): LayoutSidebarState {
  const hoverExpanded = ref(false);
  let hoverLeaveTimer: number | undefined;

  const effectiveExpanded = computed(() => {
    if (!options.collapsed.value) return true;
    if (options.pinned.value) return false;
    return options.expandOnHover.value && hoverExpanded.value;
  });

  /** << 仅控制展开/收起，与 Pin 无联动；图标随 effectiveExpanded 同步 */
  const toggleCollapsed = () => {
    if (effectiveExpanded.value) {
      if (
        options.collapsed.value &&
        hoverExpanded.value &&
        !options.pinned.value
      ) {
        hoverExpanded.value = false;
        return;
      }
      options.collapsed.value = true;
      hoverExpanded.value = false;
      return;
    }
    options.collapsed.value = false;
    hoverExpanded.value = false;
  };

  /** Pin：固定=展开并锁定；取消固定=收起到图标栏（vben 语义） */
  const togglePinned = () => {
    if (options.pinned.value) {
      options.pinned.value = false;
      options.collapsed.value = true;
    } else {
      options.pinned.value = true;
      options.collapsed.value = false;
    }
    hoverExpanded.value = false;
  };

  const onSidebarEnter = () => {
    if (hoverLeaveTimer) {
      window.clearTimeout(hoverLeaveTimer);
      hoverLeaveTimer = undefined;
    }
    if (
      options.collapsed.value &&
      !options.pinned.value &&
      options.expandOnHover.value
    ) {
      hoverExpanded.value = true;
    }
  };

  const onSidebarLeave = () => {
    if (!options.collapsed.value || options.pinned.value) return;
    hoverLeaveTimer = window.setTimeout(() => {
      hoverExpanded.value = false;
    }, 360);
  };

  return {
    collapsed: options.collapsed,
    pinned: options.pinned,
    expandOnHover: options.expandOnHover,
    hoverExpanded,
    effectiveExpanded,
    toggleCollapsed,
    togglePinned,
    onSidebarEnter,
    onSidebarLeave,
  };
}
