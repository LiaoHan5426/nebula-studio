import { defineComponent, h } from 'vue';
import type { VNode } from 'vue';
import NebulaButton from '../button/NebulaButton.vue';
import { NebulaPane } from '../pane/NebulaPane';

export interface NebulaTreeNode {
  key: string;
  title: string;
  value?: string;
  children?: NebulaTreeNode[];
}

function renderTreeNode(
  node: NebulaTreeNode,
  activeValue: string,
  onSelect: (value: string) => void,
): VNode {
  const children = node.children ?? [];
  const isLeaf = children.length === 0 && typeof node.value === 'string';
  const value = node.value ?? node.key;
  return h('li', { key: node.key, class: 'nebula-tree__item' }, [
    h('div', { class: 'nebula-tree__node' }, [
      isLeaf
        ? h(
            NebulaButton,
            {
              class: 'nebula-tree__btn',
              variant: value === activeValue ? 'primary' : 'ghost',
              onClick: () => onSelect(value),
            },
            () => node.title,
          )
        : h('span', { class: 'nebula-tree__group' }, node.title),
      children.length > 0 &&
        h(
          'ul',
          { class: 'nebula-tree__children' },
          children.map((child) => renderTreeNode(child, activeValue, onSelect)),
        ),
    ]),
  ]);
}

export const NebulaTreeMenu = defineComponent({
  name: 'NebulaTreeMenu',
  props: {
    tree: {
      type: Array as () => NebulaTreeNode[],
      default: () => [],
    },
    activeValue: {
      type: String,
      default: '',
    },
  },
  emits: ['select'],
  setup(props, { emit }) {
    return () =>
      h(
        NebulaPane,
        {
          class: 'nebula-tree',
          title: 'Feature Menu',
        },
        () =>
          h(
            'ul',
            { class: 'nebula-tree__root' },
            props.tree.map((node) =>
              renderTreeNode(node, props.activeValue, (value) =>
                emit('select', value),
              ),
            ),
          ),
      );
  },
});
