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

export { createPluginInstallerApi, pluginInstallerApi } from './api.ts';
