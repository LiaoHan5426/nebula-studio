import type { ApiResponse, VersionDiff, VersionSnapshot } from '@/shared/types';

import { apiRequest, VERSION_BASE } from '@/shared/api/client';

export const versionApi = {
  createSnapshot(body: {
    label: string;
    operatorId?: string;
    resourceId: string;
    snapshotJson: string;
  }): Promise<ApiResponse<VersionSnapshot>> {
    return apiRequest(VERSION_BASE, '/snapshots', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  listSnapshots(resourceId: string): Promise<ApiResponse<VersionSnapshot[]>> {
    return apiRequest(VERSION_BASE, `/snapshots?resourceId=${resourceId}`);
  },

  getSnapshot(snapshotId: string): Promise<ApiResponse<VersionSnapshot>> {
    return apiRequest(VERSION_BASE, `/snapshots/${snapshotId}`);
  },

  diff(leftId: string, rightId: string): Promise<ApiResponse<VersionDiff>> {
    return apiRequest(
      VERSION_BASE,
      `/snapshots/diff?leftId=${leftId}&rightId=${rightId}`,
    );
  },

  rollback(
    snapshotId: string,
    operatorId?: string,
  ): Promise<ApiResponse<VersionSnapshot>> {
    const query = operatorId ? `?operatorId=${operatorId}` : '';
    return apiRequest(
      VERSION_BASE,
      `/snapshots/${snapshotId}/rollback${query}`,
      { method: 'POST' },
    );
  },
};
