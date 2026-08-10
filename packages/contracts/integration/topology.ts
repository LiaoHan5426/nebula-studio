/**
 * @nebula-studio/contracts/integration — 拓扑观测域
 */

export interface CamelTopologyData {
  edges: TopologyEdgeData[];
  nodes: TopologyNodeData[];
  routeId: string;
}

export interface TopologyNodeData {
  id: string;
  label: string;
  type: string;
}

export interface TopologyEdgeData {
  label?: string;
  source: string;
  target: string;
}

export interface TopologyTrace {
  duration: number;
  id: string;
  payload?: Record<string, unknown>;
  routeId: string;
  status: string;
  timestamp: string;
}

export interface TopologyError {
  id: string;
  message: string;
  routeId: string;
  stackTrace?: string;
  timestamp: string;
}
