/**
 * @nebula-studio/contracts/integration — 拓扑观测域
 */

export interface CamelTopologyData {
  routeId: string;
  nodes: TopologyNodeData[];
  edges: TopologyEdgeData[];
}

export interface TopologyNodeData {
  id: string;
  label: string;
  type: string;
}

export interface TopologyEdgeData {
  source: string;
  target: string;
  label?: string;
}

export interface TopologyTrace {
  id: string;
  routeId: string;
  timestamp: string;
  duration: number;
  status: string;
  payload?: Record<string, unknown>;
}

export interface TopologyError {
  id: string;
  routeId: string;
  message: string;
  timestamp: string;
  stackTrace?: string;
}
