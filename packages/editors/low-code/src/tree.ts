import type { LowCodeNode } from '@nebula-studio/low-code-contract';

export function findNode(
  node: LowCodeNode,
  id: string,
): LowCodeNode | undefined {
  if (node.id === id) return node;
  for (const child of node.children ?? []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  if (node.slots) {
    for (const nodes of Object.values(node.slots)) {
      for (const child of nodes) {
        const found = findNode(child, id);
        if (found) return found;
      }
    }
  }
  return undefined;
}

export function mapTree(
  node: LowCodeNode,
  mapper: (current: LowCodeNode) => LowCodeNode,
): LowCodeNode {
  const next = mapper(node);
  return {
    ...next,
    children: next.children?.map((child) => mapTree(child, mapper)),
    slots: next.slots
      ? Object.fromEntries(
          Object.entries(next.slots).map(([slot, nodes]) => [
            slot,
            nodes.map((child) => mapTree(child, mapper)),
          ]),
        )
      : undefined,
  };
}

export function flattenNodeIds(tree: LowCodeNode): string[] {
  return [
    tree.id,
    ...(tree.children ?? []).flatMap(flattenNodeIds),
    ...Object.values(tree.slots ?? {}).flatMap((nodes) =>
      nodes.flatMap(flattenNodeIds),
    ),
  ];
}

export function appendChild(
  tree: LowCodeNode,
  parentId: string,
  child: LowCodeNode,
): LowCodeNode {
  return mapTree(tree, (node) =>
    node.id === parentId
      ? { ...node, children: [...(node.children ?? []), child] }
      : node,
  );
}

export function moveChild(
  tree: LowCodeNode,
  parentId: string,
  childId: string,
  offset: -1 | 1,
): LowCodeNode {
  return mapTree(tree, (node) => {
    if (node.id !== parentId || !node.children) return node;
    const index = node.children.findIndex((child) => child.id === childId);
    const target = index + offset;
    if (index < 0 || target < 0 || target >= node.children.length) return node;
    const children = [...node.children];
    const current = children[index];
    const replacement = children[target];
    if (!current || !replacement) return node;
    children[index] = replacement;
    children[target] = current;
    return { ...node, children };
  });
}

export function findParentId(
  tree: LowCodeNode,
  childId: string,
): string | undefined {
  if ((tree.children ?? []).some((child) => child.id === childId))
    return tree.id;
  for (const child of tree.children ?? []) {
    const parentId = findParentId(child, childId);
    if (parentId) return parentId;
  }
  return undefined;
}

function removeNode(
  tree: LowCodeNode,
  nodeId: string,
): { node?: LowCodeNode; tree: LowCodeNode } {
  let removed: LowCodeNode | undefined;
  const children = (tree.children ?? []).flatMap((child) => {
    if (child.id === nodeId) {
      removed = child;
      return [];
    }
    const nested = removeNode(child, nodeId);
    removed ??= nested.node;
    return [nested.tree];
  });
  return { node: removed, tree: { ...tree, children } };
}

export function deleteNode(tree: LowCodeNode, nodeId: string): LowCodeNode {
  return nodeId === tree.id ? tree : removeNode(tree, nodeId).tree;
}

export function moveNode(
  tree: LowCodeNode,
  nodeId: string,
  targetParentId: string,
): LowCodeNode {
  if (nodeId === tree.id || nodeId === targetParentId) return tree;
  const moving = findNode(tree, nodeId);
  const target = findNode(tree, targetParentId);
  if (
    !moving ||
    !target ||
    target.type !== 'Box' ||
    findNode(moving, targetParentId)
  )
    return tree;
  const detached = removeNode(tree, nodeId);
  return detached.node
    ? appendChild(detached.tree, targetParentId, detached.node)
    : tree;
}
