import { defineComponent, h, computed, ref, watch } from 'vue';
import type { VNode } from 'vue';
import { useScrollSpy } from '../../composables/useScrollSpy';
import { useBackToTop } from '../../composables/useBackToTop';

export type NebulaAnchorItem = {
  id: string;
  label: string;
};

export type NebulaAnchorBackTopMode = 'inline' | 'float';

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
    observerRootMargin: {
      type: String,
      default: '-18% 0px -60% 0px',
    },
    observerThreshold: {
      type: Array as () => number[],
      default: () => [0.1, 0.25, 0.45, 0.7],
    },
    activationViewportRatio: {
      type: Number,
      default: 0.22,
    },
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

    const { reattach: reattachScroll } = useScrollSpy({
      items: () => props.items,
      trackScroll: () => props.trackScroll,
      scrollRoot: () => props.scrollRoot,
      activationViewportRatio: () => props.activationViewportRatio,
      scrollBottomSlack: () => props.scrollBottomSlack,
      onActivate: setActive,
    });

    const backTop = useBackToTop({
      enabled: () => props.backTop,
      mode: () => props.backTopMode,
      threshold: () => props.backTopThreshold,
      behavior: () => props.backTopBehavior,
      scrollRoot: () => props.scrollRoot,
    });

    function scrollToTop(): void {
      backTop.scrollToTop();
      emit('back-top');
    }

    watch(
      () => [
        props.items,
        props.trackScroll,
        props.scrollRoot,
        props.activationViewportRatio,
        props.scrollBottomSlack,
      ],
      () => reattachScroll(),
      { deep: true },
    );

    watch(
      () => [props.backTop, props.backTopMode],
      () => {
        backTop.detach();
        backTop.attach();
      },
    );

    return () => {
      const showNav = props.items.length > 0;
      const showInlineBackTop = props.backTop && props.backTopMode === 'inline';
      const showAside = showNav || showInlineBackTop;

      const showFloatBackTop =
        props.backTop && props.backTopMode === 'float' && backTop.visible.value;

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
