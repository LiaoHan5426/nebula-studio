import { topologyRequest } from '@/shared/api/client';
import type {
  ApiResponse,
  CamelTopologyData,
  TopologyError,
  TopologyTrace,
} from '@nebula-studio/contracts/integration';

export const camelTopologyApi = {
  getTopology(routeId: string): Promise<ApiResponse<CamelTopologyData>> {
    return topologyRequest<CamelTopologyData>(
      `/${encodeURIComponent(routeId)}`,
    );
  },

  getTraces(routeId: string): Promise<ApiResponse<TopologyTrace[]>> {
    return topologyRequest<TopologyTrace[]>(
      `/${encodeURIComponent(routeId)}/traces`,
    );
  },

  getErrors(routeId: string): Promise<ApiResponse<TopologyError[]>> {
    return topologyRequest<TopologyError[]>(
      `/${encodeURIComponent(routeId)}/errors`,
    );
  },

  clearTraces(routeId: string): Promise<ApiResponse<void>> {
    return topologyRequest<void>(`/${encodeURIComponent(routeId)}/traces`, {
      method: 'DELETE',
    });
  },
};
