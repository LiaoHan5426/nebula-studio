/**
 * @nebula-studio/plugin-installer
 *
 * 插件市场：搜索、安装、卸载。
 */

export interface PluginArtifact {
  id: string;
  name: string;
  version: string;
  description?: string;
  repositoryUrl?: string;
}

export interface PluginInstallRequest {
  artifactId: string;
  version: string;
  repository?: 'maven' | 'http' | 'local';
}

export interface PluginInstallerApi {
  listAvailable(): Promise<PluginArtifact[]>;
  listInstalled(): Promise<PluginArtifact[]>;
  install(request: PluginInstallRequest): Promise<void>;
  uninstall(artifactId: string): Promise<void>;
}

const PLATFORM_BASE = '/api/platform';

async function platformFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PLATFORM_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Plugin API failed: ${res.status}`);
  }
  const body = await res.json();
  return (body.data ?? body) as T;
}

export function createPluginInstallerApi(): PluginInstallerApi {
  return {
    async listAvailable() {
      try {
        return await platformFetch<PluginArtifact[]>('/plugins/available');
      } catch {
        return [];
      }
    },
    async listInstalled() {
      try {
        return await platformFetch<PluginArtifact[]>('/plugins/installed');
      } catch {
        return [];
      }
    },
    async install(request) {
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
