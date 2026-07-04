import type { DagDefinition } from '../types/dag';

export function serializeDagDefinition(
  definition: DagDefinition | string,
): string {
  const parsed =
    typeof definition === 'string'
      ? (JSON.parse(definition) as DagDefinition)
      : definition;
  return JSON.stringify(parsed ?? { nodes: {} });
}

export function isSameDagTopology(
  left: DagDefinition | string,
  right: DagDefinition | string,
): boolean {
  const a = JSON.parse(serializeDagDefinition(left)) as DagDefinition;
  const b = JSON.parse(serializeDagDefinition(right)) as DagDefinition;
  const aNodes = a.nodes ?? {};
  const bNodes = b.nodes ?? {};

  const aIds = Object.keys(aNodes).toSorted();
  const bIds = Object.keys(bNodes).toSorted();
  if (aIds.join('|') !== bIds.join('|')) return false;

  for (const id of aIds) {
    const aNode = aNodes[id];
    const bNode = bNodes[id];
    if (!aNode || !bNode) return false;
    if (aNode.type !== bNode.type) return false;

    const aDown = [...(aNode.downstream ?? [])].toSorted().join('|');
    const bDown = [...(bNode.downstream ?? [])].toSorted().join('|');
    if (aDown !== bDown) return false;
  }

  return true;
}
