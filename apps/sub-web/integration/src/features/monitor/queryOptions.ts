import { monitorApi } from '@/features/monitor/api';
import { integrationQueryKeys } from '@/shared/query/keys';
import { unwrapApiData } from '@/shared/query/unwrap';
import { queryOptions } from '@tanstack/vue-query';

export function callLogsQueryOptions(tenantId?: string) {
  return queryOptions({
    queryKey: integrationQueryKeys.callLogs(tenantId),
    queryFn: async () => {
      const page = await unwrapApiData(
        monitorApi.callLogs({ tenantId, pageSize: 50 }),
      );
      return (page.items ?? []).map((row) => ({
        logId: row.logId ?? row.log_id,
        tenantId: row.tenantId ?? row.tenant_id,
        interfaceId: row.interfaceId ?? row.interface_id,
        interfaceName: row.interfaceName ?? row.interface_name ?? '-',
        durationMs: row.durationMs ?? row.duration_ms ?? '-',
        status: row.status,
        errorMessage: row.errorMessage ?? row.error_message ?? '-',
        createdAt: row.createdAt ?? row.created_at,
      }));
    },
  });
}

export function interfaceRankingQueryOptions(tenantId?: string) {
  return queryOptions({
    queryKey: integrationQueryKeys.logStats(tenantId),
    enabled: Boolean(tenantId),
    queryFn: async () => {
      const rows = await unwrapApiData(
        monitorApi.interfaceRanking(tenantId as string),
      );
      return (rows ?? []).map((row) => ({
        tenantId,
        interfaceId: row.interfaceId ?? row.interface_id,
        interfaceName:
          row.interfaceName ?? row.interface_name ?? row.interfaceId,
        totalCalls: row.totalCalls ?? row.callCount ?? 0,
        successRate: row.successRate ?? row.success_rate ?? '-',
        avgDuration: row.avgDuration ?? row.avg_latency_ms ?? '-',
      }));
    },
  });
}

export function topologyQueryOptions(tenantId?: string) {
  return queryOptions({
    queryKey: integrationQueryKeys.topology(tenantId),
    enabled: Boolean(tenantId),
    queryFn: async () => {
      const [nodes, edges] = await Promise.all([
        unwrapApiData(monitorApi.topologyNodes(tenantId as string)),
        unwrapApiData(monitorApi.topologyEdges(tenantId as string)),
      ]);
      return { nodes: nodes ?? [], edges: edges ?? [] };
    },
  });
}
