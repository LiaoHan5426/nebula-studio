import { computed, defineComponent, h, ref, watch } from 'vue';
import type { PropType, VNode } from 'vue';
import NebulaButton from '../button/NebulaButton.vue';
import { NebulaPane } from '../pane/NebulaPane';

export interface NebulaTreeNode {
  key: string;
  title: string;
  value?: string;
  icon?: string;
  disabled?: boolean;
  children?: NebulaTreeNode[];
}

function groupKeys(nodes: NebulaTreeNode[]): string[] {
  return nodes.flatMap((node) => [
    ...(node.children?.length ? [node.key] : []),
    ...groupKeys(node.children ?? []),
  ]);
}

export const NebulaTreeMenu = defineComponent({
  name: 'NebulaTreeMenu',
  props: {
    tree: {
      type: Array as PropType<NebulaTreeNode[]>,
      default: () => [],
    },
    activeValue: {
      type: String,
      default: undefined,
    },
    title: {
      type: String,
      default: '功能菜单',
    },
    defaultExpandAll: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['select', 'update:activeValue'],
  setup(props, { emit }) {
    const internalActive = ref('');
    const expandedKeys = ref<Set<string>>(new Set());
    const active = computed(() => props.activeValue ?? internalActive.value);

    function resetExpanded(): void {
      expandedKeys.value = new Set(
        props.defaultExpandAll ? groupKeys(props.tree) : [],
      );
    }

    function select(value: string): void {
      internalActive.value = value;
      emit('update:activeValue', value);
      emit('select', value);
    }

    function toggle(key: string): void {
      const next = new Set(expandedKeys.value);
      next.has(key) ? next.delete(key) : next.add(key);
      expandedKeys.value = next;
    }

    function renderNode(node: NebulaTreeNode, level = 0): VNode {
      const children = node.children ?? [];
      const isGroup = children.length > 0;
      const value = node.value ?? node.key;
      const expanded = expandedKeys.value.has(node.key);
      const content = [
        node.icon &&
          h(
            'span',
            { class: 'nebula-tree__icon', 'aria-hidden': 'true' },
            node.icon,
          ),
        h('span', { class: 'nebula-tree__label' }, node.title),
      ].filter(Boolean) as VNode[];

      return h('li', { key: node.key, class: 'nebula-tree__item' }, [
        isGroup
          ? h(
              'button',
              {
                type: 'button',
                class: 'nebula-tree__group',
                disabled: node.disabled,
                'aria-expanded': expanded,
                onClick: () => toggle(node.key),
              },
              [
                ...content,
                h(
                  'span',
                  { class: 'nebula-tree__chevron', 'aria-hidden': 'true' },
                  expanded ? '−' : '+',
                ),
              ],
            )
          : h(
              NebulaButton,
              {
                class: 'nebula-tree__btn',
                variant: value === active.value ? 'primary' : 'ghost',
                disabled: node.disabled,
                'aria-current': value === active.value ? 'page' : undefined,
                onClick: () => select(value),
              },
              () => content,
            ),
        isGroup && expanded
          ? h(
              'ul',
              {
                class: 'nebula-tree__children',
                role: 'group',
                'data-level': level + 1,
              },
              children.map((child) => renderNode(child, level + 1)),
            )
          : null,
      ]);
    }

    watch(() => [props.tree, props.defaultExpandAll], resetExpanded, {
      immediate: true,
      deep: true,
    });

    return () =>
      h(NebulaPane, { class: 'nebula-tree', title: props.title }, () =>
        h(
          'ul',
          { class: 'nebula-tree__root', role: 'tree' },
          props.tree.map((node) => renderNode(node)),
        ),
      );
  },
});
