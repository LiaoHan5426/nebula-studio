/**
 * @nebula-studio/contracts/integration — 集群域
 */

export interface ClusterNode {
  nodeId: string;
  nodeName?: string;
  address?: string;
  role?: string;
  status?: string;
  lastHeartbeat?: string;
  registeredAt?: string;
  loadFactor?: number;
  metadata?: Record<string, string>;
}

export interface ClusterNodeRegisterRequest {
  nodeId: string;
  nodeName?: string;
  address?: string;
  role?: string;
}
