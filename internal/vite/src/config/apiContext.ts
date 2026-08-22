import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type ApiTargetName = 'console' | 'executor' | 'platform';

export type NebulaApiProxyPresetName = 'integration' | 'standard';

export interface ApiProxyRouteConfig {
  injectExecutorServiceToken?: boolean;
  prefix: string;
  target: ApiTargetName;
}

export interface ApiNamespaceMap {
  console: {
    auth: string;
    camelSubscribe: string;
    camelTopology: string;
    cluster: string;
    console: string;
    flows: string;
    integration: string;
    monitor: string;
    subscribe: string;
  };
  executor: {
    executor: string;
  };
  platform: {
    config: string;
    governance: string;
    platform: string;
    release: string;
    releases: string;
    system: string;
    task: string;
    taskInstance: string;
    version: string;
  };
}

export interface ApiContext {
  namespaces: ApiNamespaceMap;
  proxyPresets: Record<NebulaApiProxyPresetName, ApiProxyRouteConfig[]>;
}

const API_CONTEXT_FILE = 'api-context.json';

export function apiContextPath (fromDir = dirname(fileURLToPath(import.meta.url))): string {
  return join(fromDir, API_CONTEXT_FILE);
}

export function loadApiContext (rootDir?: string): ApiContext {
  const candidates = [
    rootDir
      ? join(rootDir, 'internal', 'vite', 'src', 'config', API_CONTEXT_FILE)
      : '',
    apiContextPath(),
  ].filter(Boolean);
  const file = candidates.find((path) => existsSync(path));
  if (!file) {
    throw new Error(
      `[nebula-vite] Missing API context black box ${API_CONTEXT_FILE}`,
    );
  }
  return JSON.parse(readFileSync(file, 'utf8')) as ApiContext;
}

const apiContext = loadApiContext();

/** Browser-relative API bases grouped by `apiTargets` key. */
export const API_NAMESPACES = apiContext.namespaces;

/** Dev-proxy prefix → `apiTargets` key. Not operator configuration. */
export const API_PROXY_PRESETS = apiContext.proxyPresets;

export function requireApiProxyPreset (
  preset: NebulaApiProxyPresetName,
): ApiProxyRouteConfig[] {
  const routes = API_PROXY_PRESETS[preset];
  if (!routes?.length) {
    throw new Error(`[nebula-vite] Unknown API proxy preset "${preset}"`);
  }
  return routes;
}
