import type { DagNodeConfig, DagNodePosition } from '../types/dag';

export function readStoredPosition(
  node: DagNodeConfig,
): DagNodePosition | undefined {
  const position = node.position;
  if (!position) return undefined;
  if (typeof position.x !== 'number' || typeof position.y !== 'number') {
    return undefined;
  }
  if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) {
    return undefined;
  }
  return { x: position.x, y: position.y };
}
