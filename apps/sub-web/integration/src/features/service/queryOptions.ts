import { approvalApi } from '@/features/approval/api';
import { releaseApi } from '@/features/release/api';
import { versionApi } from '@/features/version/api';
import { integrationQueryKeys } from '@/shared/query/keys';
import { unwrapApiData } from '@/shared/query/unwrap';
import { queryOptions } from '@tanstack/vue-query';

export function approvalRequestsQueryOptions(tenantId?: string) {
  return queryOptions({
    queryKey: integrationQueryKeys.approvals(tenantId),
    queryFn: async () =>
      (await unwrapApiData(approvalApi.listRequests(tenantId))) ?? [],
  });
}

export function releasesQueryOptions(tenantId?: string) {
  return queryOptions({
    queryKey: integrationQueryKeys.releases(tenantId),
    queryFn: async () =>
      (await unwrapApiData(releaseApi.listReleases(tenantId))) ?? [],
  });
}

export function versionSnapshotsQueryOptions(resourceId?: string) {
  return queryOptions({
    queryKey: integrationQueryKeys.versions(resourceId),
    enabled: Boolean(resourceId),
    queryFn: async () =>
      (await unwrapApiData(versionApi.listSnapshots(resourceId as string))) ??
      [],
  });
}
