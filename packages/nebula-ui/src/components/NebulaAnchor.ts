import {
  defineComponent,
  h,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
  computed,
} from 'vue';
import type { VNode } from 'vue';

export type NebulaAnchorItem = {
  id: string;
  label: string;
};

export type NebulaAnchorBackTopMode = 'inline' | 'float';

/** window 或内部滚动容器上的滚动度量 */
function getScrollMetrics(root: Window | HTMLElement): {
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

/** 区块顶部相对「滚动文档」的纵向位置（与 scrollTop 同一坐标系） */
function sectionScrollTop(
  section: HTMLElement,
  scrollRoot: Window | HTMLElement,
): number {
  if (scrollRoot === window) {
    return section.getBoundingClientRect().top + window.scrollY;
  }
  const root = scrollRoot as HTMLElement;
  const sr = section.getBoundingClientRect();
  const rr = root.getBoundingClientRect();
  return root.scrollTop + (sr.top - rr.top);
}

export const NebulaAnchor = defineComponent({
  name: 'NebulaAnchor',
  props: {
    items: {
      type: Array as () => NebulaAnchorItem[],
      default: () => [],
    },
    title: {
      type: String,
      default: 'On this page',
    },
    trackScroll: {
      type: Boolean,
      default: true,
    },
    /**
     * 已废弃：高亮改由滚动位置计算（避免最后一节无法 Intersect）。
     * 保留属性以免破坏已有调用。
     */
    observerRootMargin: {
      type: String,
      default: '-18% 0px -60% 0px',
    },
    observerThreshold: {
      type: Array as () => number[],
      default: () => [0.1, 0.25, 0.45, 0.7],
    },
    /**
     * 视口内用于判定「当前读到哪一节」的参考线：距视口顶部的比例（0–1）。
     * 例如 0.22 表示参考线在距视口顶约 22% 高度处。
     */
    activationViewportRatio: {
      type: Number,
      default: 0.22,
    },
    /** 距滚动容器底部小于该值（px）时，强制高亮 `items` 中最后一项（解决尾段 API 等无法高亮） */
    scrollBottomSlack: {
      type: Number,
      default: 20,
    },
    activeId: {
      type: String,
      default: undefined,
    },
    backTop: {
      type: Boolean,
      default: false,
    },
    backTopMode: {
      type: String as () => NebulaAnchorBackTopMode,
      default: 'inline',
    },
    backTopThreshold: {
      type: Number,
      default: 320,
    },
    backTopBehavior: {
      type: String as () => ScrollBehavior,
      default: 'smooth',
    },
    backTopText: {
      type: String,
      default: 'Back to top',
    },
    scrollRoot: {
      type: String,
      default: '',
    },
    responsive: {
      type: Boolean,
      default: false,
    },
    class: {
      type: String,
      default: '',
    },
  },
  emits: ['update:activeId', 'back-top'],
  setup(props, { emit }) {
    const internalActiveId = ref<string>(
      props.activeId ?? props.items[0]?.id ?? '',
    );
    const backTopVisible = ref(false);

    let scrollRootEl: Window | HTMLElement = window;
    let scrollHandler: (() => void) | null = null;

    const isControlled = computed(() => props.activeId !== undefined);

    const resolvedActiveId = computed(() => {
      if (props.activeId !== undefined) {
        return props.activeId;
      }
      return internalActiveId.value;
    });

    watch(
      () => props.activeId,
      (v) => {
        if (v !== undefined && v !== internalActiveId.value) {
          internalActiveId.value = v;
        }
      },
    );

    watch(
      () => props.items,
      () => {
        if (
          !isControlled.value &&
          props.items.length > 0 &&
          !props.items.some((i) => i.id === internalActiveId.value)
        ) {
          internalActiveId.value = props.items[0]?.id ?? '';
        }
      },
      { deep: true },
    );

    function setActive(id: string): void {
      if (!isControlled.value) {
        internalActiveId.value = id;
      }
      emit('update:activeId', id);
    }

    function resolveScrollRoot(): Window | HTMLElement {
      if (props.scrollRoot) {
        const el = document.querySelector(props.scrollRoot);
        if (el instanceof HTMLElement) return el;
      }
      return window;
    }

    function syncActiveAnchor(): void {
      if (!props.trackScroll || props.items.length === 0) return;

      const root = scrollRootEl;
      const { scrollTop, clientHeight, scrollHeight } = getScrollMetrics(root);
      const lastDef = props.items[props.items.length - 1];

      if (
        lastDef &&
        scrollTop + clientHeight >= scrollHeight - props.scrollBottomSlack
      ) {
        setActive(lastDef.id);
        return;
      }

      const ratio = Math.min(
        0.48,
        Math.max(0.06, props.activationViewportRatio),
      );
      const lineY = scrollTop + clientHeight * ratio;

      let chosen = props.items[0]?.id ?? '';
      for (const item of props.items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const top = sectionScrollTop(el, root);
        if (top <= lineY) {
          chosen = item.id;
        }
      }
      setActive(chosen);
    }

    function updateBackTopVisible(): void {
      if (!props.backTop || props.backTopMode !== 'float') return;
      const { scrollTop } = getScrollMetrics(scrollRootEl);
      backTopVisible.value = scrollTop > props.backTopThreshold;
    }

    function scrollToTop(): void {
      const target = props.scrollRoot
        ? document.querySelector(props.scrollRoot)
        : null;
      if (target instanceof HTMLElement) {
        target.scrollTo({ top: 0, behavior: props.backTopBehavior });
      } else {
        window.scrollTo({ top: 0, behavior: props.backTopBehavior });
      }
      emit('back-top');
    }

    function onScroll(): void {
      syncActiveAnchor();
      updateBackTopVisible();
    }

    function attachScrollListeners(): void {
      detachScrollListeners();
      scrollRootEl = resolveScrollRoot();

      const needAnchor =
        props.trackScroll && props.items.length > 0;
      const needBackTop =
        props.backTop && props.backTopMode === 'float';

      if (!needAnchor && !needBackTop) return;

      scrollHandler = onScroll;
      if (scrollRootEl === window) {
        window.addEventListener('scroll', scrollHandler, { passive: true });
      } else {
        scrollRootEl.addEventListener('scroll', scrollHandler, {
          passive: true,
        });
      }
      onScroll();
    }

    function detachScrollListeners(): void {
      if (!scrollHandler) return;
      if (scrollRootEl === window) {
        window.removeEventListener('scroll', scrollHandler);
      } else {
        scrollRootEl.removeEventListener('scroll', scrollHandler);
      }
      scrollHandler = null;
      scrollRootEl = window;
    }

    onMounted(() => {
      attachScrollListeners();
    });

    onUnmounted(() => {
      detachScrollListeners();
    });

    watch(
      () => [
        props.items,
        props.trackScroll,
        props.scrollRoot,
        props.activationViewportRatio,
        props.scrollBottomSlack,
      ],
      () => {
        void nextTick(() => {
          detachScrollListeners();
          attachScrollListeners();
        });
      },
      { deep: true },
    );

    watch(
      () => [props.backTop, props.backTopMode],
      () => {
        detachScrollListeners();
        attachScrollListeners();
      },
    );

    return () => {
      const showNav = props.items.length > 0;
      const showInlineBackTop = props.backTop && props.backTopMode === 'inline';
      const showAside = showNav || showInlineBackTop;

      const showFloatBackTop =
        props.backTop &&
        props.backTopMode === 'float' &&
        backTopVisible.value;

      const aside = showAside
        ? h(
            'aside',
            {
              class: [
                'nebula-anchor',
                props.responsive && 'nebula-anchor--responsive',
                props.class,
              ]
                .filter(Boolean)
                .join(' '),
              'aria-label': props.title,
            },
            [
              ...(showNav
                ? [
                    h('p', { class: 'nebula-anchor__title' }, props.title),
                    ...props.items.map((item) =>
                      h(
                        'a',
                        {
                          key: item.id,
                          class: [
                            'nebula-anchor__link',
                            resolvedActiveId.value === item.id && 'is-active',
                          ]
                            .filter(Boolean)
                            .join(' '),
                          href: `#${item.id}`,
                        },
                        item.label,
                      ),
                    ),
                  ]
                : []),
              ...(showInlineBackTop
                ? [
                    h(
                      'button',
                      {
                        type: 'button',
                        class: 'nebula-anchor__back-top',
                        onClick: scrollToTop,
                      },
                      props.backTopText,
                    ),
                  ]
                : []),
            ],
          )
        : null;

      const floatBtn = showFloatBackTop
        ? h(
            'button',
            {
              type: 'button',
              class: 'nebula-anchor__float',
              'aria-label': props.backTopText,
              onClick: scrollToTop,
            },
            props.backTopText,
          )
        : null;

      if (!aside && !floatBtn) {
        return null;
      }

      const wrapChildren = [aside, floatBtn].filter(Boolean) as VNode[];
      if (wrapChildren.length === 1) {
        const [single] = wrapChildren;
        return single ?? null;
      }
      return h('div', { class: 'nebula-anchor-root' }, wrapChildren);
    };
  },
});
