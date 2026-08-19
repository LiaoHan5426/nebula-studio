import type { ProxyOptions } from 'vite';

import { resolveApiProxyRoutes } from '../config/studioRuntime.ts';
import { loadWindowsConfig } from '../config/windowsManifest.ts';

export type NebulaApiProxyPreset = 'integration' | 'standard';

export interface NebulaApiProxyTargets {
  console?: string;
  executor?: string;
  platform?: string;
}

export interface CreateNebulaApiProxyOptions {
  preset: NebulaApiProxyPreset;
  /** Enable SSE-friendly proxy settings (no timeout/buffering). Default true. */
  sse?: boolean;
  /** Override dev proxy targets; falls back to configs/windows.json apiTargets and env vars. */
  targets?: NebulaApiProxyTargets;
}

const TARGET_ENV: Record<string, string | undefined> = {
  platform: process.env.NEBULA_PLATFORM_TARGET,
  console: process.env.NEBULA_CONSOLE_TARGET,
  executor: process.env.NEBULA_EXECUTOR_TARGET,
};

function resolveTargets(
  options: CreateNebulaApiProxyOptions,
): Record<string, string> {
  const fromConfig = loadWindowsConfig().apiTargets ?? {};
  const merged: Record<string, string> = { ...fromConfig };
  for (const [name, value] of Object.entries(TARGET_ENV)) {
    if (value) merged[name] = value;
  }
  for (const [name, value] of Object.entries(options.targets ?? {})) {
    if (value !== undefined) merged[name] = value;
  }
  return merged;
}

function isSseRequest (url?: string): boolean {
  return url?.includes('/events') ?? false;
}

const configureSseProxy: NonNullable<ProxyOptions['configure']> = (
  proxy,
  _options,
) => {
  proxy.on('proxyRes', (proxyRes, req) => {
    const res = proxyRes as {
      headers: Record<string, string | string[] | undefined>;
    };
    const request = req as { url?: string };
    if (!isSseRequest(request.url)) return;
    delete res.headers['content-length'];
    res.headers['cache-control'] = 'no-cache';
    res.headers.connection = 'keep-alive';
    res.headers['x-accel-buffering'] = 'no';
  });
  proxy.on('error', (err, req, res) => {
    const request = req as { url?: string };
    const response = res as {
      end?: () => void;
      headersSent?: boolean;
      writeHead?: (code: number) => void;
    };
    if (isSseRequest(request.url)) {
      if (response && !response.headersSent && response.writeHead) {
        response.writeHead(502);
      }
      response?.end?.();
      return;
    }
    console.error('[nebula-vite] http proxy error:', request.url, err);
  });
};

function buildProxyEntry (target: string, sse: boolean): ProxyOptions {
  if (!sse) {
    return { target, changeOrigin: true };
  }
  return {
    target,
    changeOrigin: true,
    timeout: 0,
    proxyTimeout: 0,
    configure: configureSseProxy,
  };
}

/**
 * Executor 管理 API 使用服务身份（X-Service-Token），浏览器不应持有该令牌。
 * 开发代理在转发时注入，与 platform-integration / executor 的默认值对齐。
 */
function resolveExecutorServiceToken (): string {
  return (
    process.env.NEBULA_EXECUTOR_SERVICE_TOKEN ??
    'change-me-platform-executor-service-token'
  );
}

function buildExecutorProxyEntry (target: string, sse: boolean): ProxyOptions {
  const serviceToken = resolveExecutorServiceToken();
  const injectServiceToken: NonNullable<ProxyOptions['configure']> = (
    proxy,
    options,
  ) => {
    proxy.on('proxyReq', (proxyReq) => {
      proxyReq.setHeader('X-Service-Token', serviceToken);
    });
    if (sse) {
      configureSseProxy(proxy, options);
    }
  };

  if (!sse) {
    return {
      target,
      changeOrigin: true,
      configure: injectServiceToken,
    };
  }
  return {
    target,
    changeOrigin: true,
    timeout: 0,
    proxyTimeout: 0,
    configure: injectServiceToken,
  };
}

function routesFromConfig(
  preset: NebulaApiProxyPreset,
  targets: Record<string, string>,
  sse: boolean,
): Array<[string, ProxyOptions]> {
  return resolveApiProxyRoutes(preset).map((route) => {
    const target = targets[route.target];
    if (target === undefined) {
      throw new Error(
        `[nebula-vite] Proxy route "${route.prefix}" references unknown target "${route.target}"`,
      );
    }
    if (!target) {
      throw new Error(
        `[nebula-vite] Proxy route "${route.prefix}" has no target configured`,
      );
    }
    const entry = route.injectExecutorServiceToken
      ? buildExecutorProxyEntry(target, sse)
      : buildProxyEntry(target, sse);
    return [route.prefix, entry];
  });
}

/**
 * Create dev-server API proxy rules from a preset and configs/windows.json.
 * Routes are ordered from most specific prefix to least specific.
 */
export function createNebulaApiProxy(
  options: CreateNebulaApiProxyOptions,
): Record<string, ProxyOptions> {
  const sse = options.sse ?? true;
  const targets = resolveTargets(options);
  const routes = routesFromConfig(options.preset, targets, sse);

  const seen = new Set<string>();
  const proxy: Record<string, ProxyOptions> = {};
  for (const [prefix, entry] of routes) {
    if (seen.has(prefix)) {
      throw new Error(
        `[nebula-vite] Duplicate proxy route "${prefix}" in preset "${options.preset}"`,
      );
    }
    seen.add(prefix);
    proxy[prefix] = entry;
  }

  for (const [prefix, entry] of Object.entries(proxy)) {
    if (!entry.target) {
      throw new Error(
        `[nebula-vite] Proxy route "${prefix}" has no target configured`,
      );
    }
  }

  return proxy;
}
