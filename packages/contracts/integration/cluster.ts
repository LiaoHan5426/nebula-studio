/**
 * @nebula-studio/contracts/integration — 集群域
 */

export interface ClusterNode {
  address?: string;
  lastHeartbeat?: string;
  loadFactor?: number;
  metadata?: Record<string, string>;
  nodeId: string;
  nodeName?: string;
  registeredAt?: string;
  role?: string;
  status?: string;
}

export interface ClusterNodeRegisterRequest {
  address?: string;
  nodeId: string;
  nodeName?: string;
  role?: string;
}
