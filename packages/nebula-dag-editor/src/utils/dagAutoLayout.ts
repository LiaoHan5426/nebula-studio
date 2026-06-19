export interface DagLayoutEdge {
  source: string;
  target: string;
}

export interface DagAutoLayoutOptions {
  columnWidth?: number;
  rowHeight?: number;
  originX?: number;
  originY?: number;
}

const DEFAULT_COLUMN_WIDTH = 196;
const DEFAULT_ROW_HEIGHT = 104;
const DEFAULT_ORIGIN_X = 56;
const DEFAULT_ORIGIN_Y = 56;

function normalizeEdges(
  nodeIds: string[],
  edges: DagLayoutEdge[],
): DagLayoutEdge[] {
  const idSet = new Set(nodeIds);
  const seen = new Set<string>();
  const normalized: DagLayoutEdge[] = [];

  for (const edge of edges) {
    if (!idSet.has(edge.source) || !idSet.has(edge.target)) continue;
    if (edge.source === edge.target) continue;
    const key = `${edge.source}__${edge.target}`;
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push({ source: edge.source, target: edge.target });
  }

  return normalized;
}

function buildParents(
  nodeIds: string[],
  edges: DagLayoutEdge[],
): Map<string, string[]> {
  const parents = new Map<string, string[]>();
  for (const id of nodeIds) parents.set(id, []);
  for (const edge of edges) {
    parents.get(edge.target)?.push(edge.source);
  }
  for (const list of parents.values()) {
    list.sort();
  }
  return parents;
}

/** Longest-path rank: each node sits one column right of its deepest parent. */
function buildRankMap(
  nodeIds: string[],
  edges: DagLayoutEdge[],
): Map<string, number> {
  const parents = buildParents(nodeIds, edges);
  const ranks = new Map<string, number>();
  const visiting = new Set<string>();

  function rankFor(id: string): number {
    const cached = ranks.get(id);
    if (cached !== undefined) return cached;
    if (visiting.has(id)) return 0;

    visiting.add(id);
    const parentIds = parents.get(id) ?? [];
    const parentRank =
      parentIds.length === 0
        ? -1
        : Math.max(...parentIds.map((parentId) => rankFor(parentId)));
    visiting.delete(id);

    const rank = parentRank + 1;
    ranks.set(id, rank);
    return rank;
  }

  for (const id of nodeIds) {
    rankFor(id);
  }

  return ranks;
}

function groupByRank(
  nodeIds: string[],
  ranks: Map<string, number>,
): string[][] {
  const maxRank = Math.max(0, ...nodeIds.map((id) => ranks.get(id) ?? 0));
  const layers: string[][] = Array.from({ length: maxRank + 1 }, () => []);

  for (const id of nodeIds) {
    const rank = ranks.get(id) ?? 0;
    layers[rank]?.push(id);
  }

  return layers;
}

function orderLayer(
  layer: string[],
  parents: Map<string, string[]>,
  previousOrder: string[],
): string[] {
  if (layer.length <= 1) return layer;

  const previousIndex = new Map(
    previousOrder.map((id, index) => [id, index] as const),
  );

  return [...layer].toSorted((left, right) => {
    const leftParents = parents.get(left) ?? [];
    const rightParents = parents.get(right) ?? [];

    const leftCenter = averageParentIndex(leftParents, previousIndex);
    const rightCenter = averageParentIndex(rightParents, previousIndex);

    if (leftCenter !== rightCenter) return leftCenter - rightCenter;
    return left.localeCompare(right);
  });
}

function averageParentIndex(
  parentIds: string[],
  previousIndex: Map<string, number>,
): number {
  if (parentIds.length === 0) return Number.POSITIVE_INFINITY;
  const total = parentIds.reduce(
    (sum, parentId) => sum + (previousIndex.get(parentId) ?? 0),
    0,
  );
  return total / parentIds.length;
}

function layoutConnectedNodes(
  layers: string[][],
  parents: Map<string, string[]>,
  options: Required<DagAutoLayoutOptions>,
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const orderedLayers: string[][] = [];
  let previousOrder: string[] = [];

  for (const layer of layers) {
    const ordered = orderLayer(layer, parents, previousOrder);
    orderedLayers.push(ordered);
    previousOrder = ordered;
  }

  const maxLayerSize = Math.max(
    1,
    ...orderedLayers.map((layer) => layer.length),
  );
  const globalCenterY =
    options.originY + ((maxLayerSize - 1) * options.rowHeight) / 2;

  orderedLayers.forEach((layer, column) => {
    const x = options.originX + column * options.columnWidth;
    const blockHeight = (layer.length - 1) * options.rowHeight;
    const startY = globalCenterY - blockHeight / 2;

    layer.forEach((id, row) => {
      positions.set(id, {
        x,
        y: startY + row * options.rowHeight,
      });
    });
  });

  return positions;
}

function layoutDisconnectedNodes(
  nodeIds: string[],
  connectedPositions: Map<string, { x: number; y: number }>,
  options: Required<DagAutoLayoutOptions>,
): Map<string, { x: number; y: number }> {
  const positions = new Map(connectedPositions);
  const disconnected = nodeIds.filter((id) => !positions.has(id));
  if (disconnected.length === 0) return positions;

  const maxY = Math.max(
    options.originY,
    ...[...connectedPositions.values()].map((point) => point.y),
  );
  const baseY =
    connectedPositions.size > 0
      ? maxY + options.rowHeight * 1.6
      : options.originY;

  disconnected.forEach((id, index) => {
    positions.set(id, {
      x: options.originX + index * options.columnWidth,
      y: baseY,
    });
  });

  return positions;
}

/**
 * Layered left-to-right DAG layout.
 * - Linear chains spread horizontally (A → B → C → D).
 * - Forks place branches in the same column, vertically stacked.
 * - Root nodes align to the vertical center of the widest column.
 */
export function computeAutoLayout(
  nodeIds: string[],
  edges: DagLayoutEdge[],
  options: DagAutoLayoutOptions = {},
): Map<string, { x: number; y: number }> {
  const resolved: Required<DagAutoLayoutOptions> = {
    columnWidth: options.columnWidth ?? DEFAULT_COLUMN_WIDTH,
    rowHeight: options.rowHeight ?? DEFAULT_ROW_HEIGHT,
    originX: options.originX ?? DEFAULT_ORIGIN_X,
    originY: options.originY ?? DEFAULT_ORIGIN_Y,
  };

  if (nodeIds.length === 0) return new Map();

  const normalizedEdges = normalizeEdges(nodeIds, edges);
  const parents = buildParents(nodeIds, normalizedEdges);
  const connectedIds = new Set<string>();
  for (const edge of normalizedEdges) {
    connectedIds.add(edge.source);
    connectedIds.add(edge.target);
  }

  const connectedNodeIds = nodeIds.filter((id) => connectedIds.has(id));
  if (connectedNodeIds.length === 0) {
    return layoutDisconnectedNodes(nodeIds, new Map(), resolved);
  }

  const ranks = buildRankMap(connectedNodeIds, normalizedEdges);
  const layers = groupByRank(connectedNodeIds, ranks);
  const connectedPositions = layoutConnectedNodes(layers, parents, resolved);

  return layoutDisconnectedNodes(nodeIds, connectedPositions, resolved);
}
