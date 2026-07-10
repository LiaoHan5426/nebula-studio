import { clusterRequest } from '@/shared/api/client';
import type {
  ApiResponse,
  ClusterNode,
  ClusterNodeRegisterRequest,
} from '@nebula-studio/contracts/integration';

export const clusterApi = {
  listNodes(status?: string): Promise<ApiResponse<ClusterNode[]>> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return clusterRequest<ClusterNode[]>(`/nodes${query}`);
  },

  getNode(nodeId: string): Promise<ApiResponse<ClusterNode>> {
    return clusterRequest<ClusterNode>(`/nodes/${nodeId}`);
  },

  register(
    body: ClusterNodeRegisterRequest,
  ): Promise<ApiResponse<ClusterNode>> {
    return clusterRequest<ClusterNode>('/nodes/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  heartbeat(
    nodeId: string,
    loadFactor?: number,
  ): Promise<ApiResponse<ClusterNode>> {
    return clusterRequest<ClusterNode>(`/nodes/${nodeId}/heartbeat`, {
      method: 'POST',
      body: JSON.stringify(loadFactor !== undefined ? { loadFactor } : {}),
    });
  },
};
