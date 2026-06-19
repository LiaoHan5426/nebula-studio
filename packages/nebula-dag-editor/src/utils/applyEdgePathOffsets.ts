export interface LayoutPoint {
  x: number;
  y: number;
}

export interface RoutableEdge {
  id: string;
  source: string;
  target: string;
}

export interface EdgePathOffsetOptions {
  spread?: number;
  borderRadius?: number;
}

function sortByTargetY<T extends RoutableEdge>(
  edgeList: T[],
  nodePositionById: Map<string, LayoutPoint>,
): T[] {
  return [...edgeList].toSorted((left, right) => {
    const leftY = nodePositionById.get(left.target)?.y ?? 0;
    const rightY = nodePositionById.get(right.target)?.y ?? 0;
    if (leftY !== rightY) return leftY - rightY;
    return left.target.localeCompare(right.target);
  });
}

function centeredOffset(index: number, count: number, spread: number): number {
  if (count <= 1) return 0;
  return (index - (count - 1) / 2) * spread;
}

/** Spread smoothstep offsets so fork edges do not overlap vertically. */
export function applyEdgePathOffsets<T extends RoutableEdge>(
  edgeList: T[],
  nodePositionById: Map<string, LayoutPoint>,
  options: EdgePathOffsetOptions = {},
): Array<
  T & {
    type: 'smoothstep';
    pathOptions: { borderRadius: number; offset: number };
  }
> {
  const spread = options.spread ?? 20;
  const borderRadius = options.borderRadius ?? 14;
  const edgesBySource = new Map<string, T[]>();

  for (const edge of edgeList) {
    const group = edgesBySource.get(edge.source) ?? [];
    group.push(edge);
    edgesBySource.set(edge.source, group);
  }

  return edgeList.map((edge) => {
    const siblings = sortByTargetY(
      edgesBySource.get(edge.source) ?? [edge],
      nodePositionById,
    );
    const index = siblings.findIndex((item) => item.id === edge.id);
    const offset = centeredOffset(index, siblings.length, spread);

    return {
      ...edge,
      type: 'smoothstep' as const,
      pathOptions: {
        borderRadius,
        offset,
      },
    };
  });
}
