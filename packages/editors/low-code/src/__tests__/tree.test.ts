import { createDemoBoardSnapshot } from '@nebula-studio/low-code-contract';

import { describe, expect, it } from 'vitest';

import {
  appendChild,
  deleteNode,
  findNode,
  findParentId,
  flattenNodeIds,
  mapTree,
  moveChild,
  moveNode,
} from '../tree.ts';

describe('low-code editor tree', () => {
  it('finds and patches nodes for the inspector', () => {
    const tree = createDemoBoardSnapshot().definition.tree;
    expect(findNode(tree, 'orders')?.type).toBe('MetricCard');
    const next = mapTree(tree, (node) =>
      node.id === 'orders'
        ? { ...node, props: { ...node.props, label: '成交' } }
        : node,
    );
    expect(findNode(next, 'orders')?.props?.label).toBe('成交');
  });

  it('supports nested palette insertion and sibling reorder', () => {
    const tree = createDemoBoardSnapshot().definition.tree;
    const added = {
      id: 'new-card',
      type: 'MetricCard',
      componentVersion: '1.0.0',
    };
    const nested = appendChild(tree, 'root', added);
    expect(findNode(nested, 'new-card')?.type).toBe('MetricCard');
    const reordered = moveChild(nested, 'root', 'new-card', -1);
    expect(reordered.children?.at(-1)?.id).not.toBe('new-card');
  });

  it('moves nodes between containers without allowing cycles and deletes them', () => {
    const tree = createDemoBoardSnapshot().definition.tree;
    const box = {
      id: 'nested',
      type: 'Box',
      componentVersion: '1.0.0',
      children: [],
    };
    const withBox = appendChild(tree, 'root', box);
    const moved = moveNode(withBox, 'orders', 'nested');
    expect(findParentId(moved, 'orders')).toBe('nested');
    expect(moveNode(moved, 'nested', 'orders')).toEqual(moved);
    expect(findNode(deleteNode(moved, 'orders'), 'orders')).toBeUndefined();
  });

  it('flattens the tree in keyboard navigation order', () => {
    const tree = createDemoBoardSnapshot().definition.tree;
    expect(flattenNodeIds(tree)).toEqual(['root', 'title', 'orders']);
  });
});
