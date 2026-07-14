import { createStudioApiClient } from '@nebula-studio/api-client';
import type {
  PluginArtifact,
  PluginInstallRequest,
  PluginInstallerApi,
} from './types.ts';

const PLATFORM_BASE = '/api/platform';

export function createPluginInstallerApi(
  client = createStudioApiClient(),
): PluginInstallerApi {
  async function platformFetch<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const response = await client.fetchUrl(`${PLATFORM_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      ...init,
    });
    if (!response.ok) {
      throw new Error(`Plugin API failed: ${response.status}`);
    }
    const body = await response.json();
    return (body.data ?? body) as T;
  }

  return {
    async listAvailable() {
      return platformFetch<PluginArtifact[]>('/plugins/available');
    },
    async listInstalled() {
      return platformFetch<PluginArtifact[]>('/plugins/installed');
    },
    async install(request: PluginInstallRequest) {
      await platformFetch('/plugins/install', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },
    async uninstall(artifactId) {
      await platformFetch(`/plugins/${encodeURIComponent(artifactId)}`, {
        method: 'DELETE',
      });
    },
  };
}

export const pluginInstallerApi = createPluginInstallerApi();
