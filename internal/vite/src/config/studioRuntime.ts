import type {
  ApiProxyRouteConfig,
  NebulaApiProxyPresetName,
} from './apiContext.ts';
import { requireApiProxyPreset } from './apiContext.ts';
import { hasWebShellPath, loadWindowsConfig } from './windowsManifest.ts';
import type {
  RendererRuntimeFields,
  WindowsConfig,
} from './windowsManifest.ts';

export interface ResolvedDevServer {
  basePath: string;
  baseUrl: string;
  host: string;
  port: number;
}

export interface ResolvedStandaloneApp extends ResolvedDevServer {
  appId: string;
  embedPath?: string;
  proxyPreset?: NebulaApiProxyPresetName;
}

export interface ResolvedHealthCheck {
  id: string;
  label: string;
  probeUrl: string;
  startupUrl: string;
  target: string;
}

function joinOrigin(origin: string, path = '/'): string {
  const base = origin.replace(/\/$/, '');
  if (!path || path === '/') return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function httpOrigin(host: string, port: number, basePath = '/'): string {
  return joinOrigin(`http://${host}:${port}`, basePath);
}

export function rewriteOriginHost(origin: string, host: string): string {
  const url = new URL(origin);
  url.hostname = host;
  return url.origin;
}

export function requireApiTarget(config: WindowsConfig, name: string): string {
  const target = config.apiTargets?.[name];
  if (!target) {
    throw new Error(`[nebula-vite] Missing apiTargets.${name} in windows.json`);
  }
  return target;
}

export function resolveShellWeb(
  config: WindowsConfig = loadWindowsConfig(),
): ResolvedDevServer {
  const web = config.shell?.web;
  if (!web) {
    throw new Error('[nebula-vite] Missing shell.web in windows.json');
  }
  const basePath = web.basePath ?? '/';
  return {
    host: web.host,
    port: web.port,
    basePath,
    baseUrl: httpOrigin(web.host, web.port, basePath),
  };
}

function collectRendererEntries(
  config: WindowsConfig,
): Array<{ embedPath?: string; fields: RendererRuntimeFields }> {
  const entries: Array<{
    embedPath?: string;
    fields: RendererRuntimeFields;
  }> = [];
  for (const win of Object.values(config.windows)) {
    entries.push({
      fields: win,
      embedPath: hasWebShellPath(win)
        ? `/?${config.shell?.embedQuery ?? 'embed'}=${win.renderer}`
        : undefined,
    });
  }
  if (config.modalRenderers) {
    for (const modal of Object.values(config.modalRenderers)) {
      entries.push({
        fields: modal,
        embedPath: hasWebShellPath(modal)
          ? `/?${config.shell?.embedQuery ?? 'embed'}=${modal.renderer}`
          : undefined,
      });
    }
  }
  return entries;
}

export function resolveStandaloneApp(
  appId: string,
  config: WindowsConfig = loadWindowsConfig(),
): ResolvedStandaloneApp {
  const shell = resolveShellWeb(config);
  const match = collectRendererEntries(config).find(
    (entry) => entry.fields.renderer === appId,
  );
  if (!match?.fields.standalone) {
    throw new Error(
      `[nebula-vite] Missing standalone address for sub-web "${appId}" in windows.json`,
    );
  }
  const standalone = match.fields.standalone;
  const host = standalone.host ?? shell.host;
  const basePath = standalone.basePath ?? '/';
  return {
    appId,
    host,
    port: standalone.port,
    basePath,
    baseUrl: httpOrigin(host, standalone.port, basePath),
    proxyPreset: match.fields.proxyPreset,
    embedPath: match.embedPath,
  };
}

export function resolveShellEmbedPath(
  renderer: string,
  config: WindowsConfig = loadWindowsConfig(),
): string {
  const query = config.shell?.embedQuery ?? 'embed';
  return `/?${query}=${encodeURIComponent(renderer)}`;
}

export function tryResolveStandalonePort(
  appId: string,
  config: WindowsConfig = loadWindowsConfig(),
): number | undefined {
  try {
    return resolveStandaloneApp(appId, config).port;
  } catch {
    return undefined;
  }
}

export function resolveApiProxyRoutes(
  preset: NebulaApiProxyPresetName,
): ApiProxyRouteConfig[] {
  return requireApiProxyPreset(preset);
}

export function resolveOpenApiUrl(
  config: WindowsConfig = loadWindowsConfig(),
): string {
  const spec = config.realStack?.openapi.platform;
  if (!spec) {
    throw new Error(
      '[nebula-vite] Missing realStack.openapi.platform in windows.json',
    );
  }
  return joinOrigin(requireApiTarget(config, spec.target), spec.path);
}

export function resolveHealthChecks(
  config: WindowsConfig = loadWindowsConfig(),
  options: { host?: string } = {},
): ResolvedHealthCheck[] {
  const checks = config.realStack?.healthChecks;
  if (!checks?.length) {
    throw new Error(
      '[nebula-vite] Missing realStack.healthChecks in windows.json',
    );
  }
  return checks.map((check) => {
    const origin = options.host
      ? rewriteOriginHost(requireApiTarget(config, check.target), options.host)
      : requireApiTarget(config, check.target);
    return {
      id: check.id,
      label: check.label,
      target: check.target,
      startupUrl: joinOrigin(origin, check.startupPath),
      probeUrl: joinOrigin(origin, check.probePath),
    };
  });
}

export function resolveUnauthorizedProbeUrl(
  config: WindowsConfig = loadWindowsConfig(),
): string {
  const probe = config.realStack?.unauthorizedProbe;
  if (!probe) {
    throw new Error(
      '[nebula-vite] Missing realStack.unauthorizedProbe in windows.json',
    );
  }
  return joinOrigin(requireApiTarget(config, probe.target), probe.path);
}

export function resolveE2eMockRoutePatterns(
  config: WindowsConfig = loadWindowsConfig(),
): string[] {
  const patterns = config.e2e?.mockRoutePatterns;
  if (!patterns?.length) {
    throw new Error(
      '[nebula-vite] Missing e2e.mockRoutePatterns in windows.json',
    );
  }
  return patterns;
}

export function resolvePlaywrightWeb(
  config: WindowsConfig = loadWindowsConfig(),
): ResolvedDevServer {
  return resolveShellWeb(config);
}
