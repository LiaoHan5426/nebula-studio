import type { ProxyOptions } from 'vite';
import { loadWindowsConfig } from '../config/windowsManifest.ts';

export type NebulaApiProxyPreset = 'integration' | 'standard';

export interface NebulaApiProxyTargets {
  platform?: string;
  console?: string;
  executor?: string;
}

export interface CreateNebulaApiProxyOptions {
  preset: NebulaApiProxyPreset;
  /** Enable SSE-friendly proxy settings (no timeout/buffering). Default true. */
  sse?: boolean;
  /** Override dev proxy targets; falls back to configs/windows.json apiTargets and env vars. */
  targets?: NebulaApiProxyTargets;
}

function resolveTargets(
  options: CreateNebulaApiProxyOptions,
): Required<NebulaApiProxyTargets> {
  const fromConfig = loadWindowsConfig().apiTargets ?? {};
  return {
    platform:
      options.targets?.platform ??
      process.env.NEBULA_PLATFORM_TARGET ??
      fromConfig.platform ??
      'http://localhost:8090',
    console:
      options.targets?.console ??
      process.env.NEBULA_CONSOLE_TARGET ??
      fromConfig.console ??
      'http://localhost:8080',
    executor:
      options.targets?.executor ??
      process.env.NEBULA_EXECUTOR_TARGET ??
      fromConfig.executor ??
      'http://localhost:8081',
  };
}

function isSseRequest(url?: string): boolean {
  return url?.includes('/events') ?? false;
}

const configureSseProxy: NonNullable<ProxyOptions['configure']> = (proxy) => {
  proxy.on('proxyRes', (proxyRes, req) => {
    const res = proxyRes as {
      headers: Record<string, string | string[] | undefined>;
    };
    const request = req as { url?: string };
    if (!isSseRequest(request.url)) return;
    delete res.headers['content-length'];
    res.headers['cache-control'] = 'no-cache';
    res.headers['connection'] = 'keep-alive';
    res.headers['x-accel-buffering'] = 'no';
  });
  proxy.on('error', (err, req, res) => {
    const request = req as { url?: string };
    const response = res as {
      headersSent?: boolean;
      writeHead?: (code: number) => void;
      end?: () => void;
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

function buildProxyEntry(target: string, sse: boolean): ProxyOptions {
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
function resolveExecutorServiceToken(): string {
  return (
    process.env.NEBULA_EXECUTOR_SERVICE_TOKEN ??
    'change-me-platform-executor-service-token'
  );
}

function buildExecutorProxyEntry(target: string, sse: boolean): ProxyOptions {
  const serviceToken = resolveExecutorServiceToken();
  const injectServiceToken: NonNullable<ProxyOptions['configure']> = (
    proxy,
  ) => {
    proxy.on('proxyReq', (proxyReq) => {
      proxyReq.setHeader('X-Service-Token', serviceToken);
    });
    if (sse) {
      configureSseProxy(proxy);
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

function integrationRoutes(
  targets: Required<NebulaApiProxyTargets>,
  sse: boolean,
): Array<[string, ProxyOptions]> {
  return [
    ['/api/integration/gateway', buildProxyEntry(targets.executor, sse)],
    ['/api/integration/demo', buildProxyEntry(targets.executor, sse)],
    ['/api/executor', buildExecutorProxyEntry(targets.executor, sse)],
    ['/api/system', buildProxyEntry(targets.platform, sse)],
    ['/api/platform', buildProxyEntry(targets.platform, sse)],
    ['/api/security/governance', buildProxyEntry(targets.platform, sse)],
    ['/api/version', buildProxyEntry(targets.platform, sse)],
    ['/api/release', buildProxyEntry(targets.platform, sse)],
    ['/api/releases', buildProxyEntry(targets.platform, sse)],
    // 设置子应用配置页走 config-center，与 standard preset 对齐到 platform-console
    ['/api/config', buildProxyEntry(targets.platform, sse)],
    ['/api/task', buildProxyEntry(targets.platform, sse)],
    ['/api', buildProxyEntry(targets.console, sse)],
  ];
}

function standardRoutes(
  targets: Required<NebulaApiProxyTargets>,
  sse: boolean,
): Array<[string, ProxyOptions]> {
  return [
    ['/api/system', buildProxyEntry(targets.platform, sse)],
    ['/api/platform', buildProxyEntry(targets.platform, sse)],
    ['/api/security/governance', buildProxyEntry(targets.platform, sse)],
    ['/api/version', buildProxyEntry(targets.platform, sse)],
    ['/api/release', buildProxyEntry(targets.platform, sse)],
    ['/api/releases', buildProxyEntry(targets.platform, sse)],
    ['/api/config', buildProxyEntry(targets.platform, sse)],
    ['/api/task', buildProxyEntry(targets.platform, sse)],
    ['/api', buildProxyEntry(targets.console, sse)],
  ];
}

/**
 * Create dev-server API proxy rules from a preset and configs/windows.json targets.
 * Routes are ordered from most specific prefix to least specific.
 */
export function createNebulaApiProxy(
  options: CreateNebulaApiProxyOptions,
): Record<string, ProxyOptions> {
  const sse = options.sse ?? true;
  const targets = resolveTargets(options);
  const routes =
    options.preset === 'integration'
      ? integrationRoutes(targets, sse)
      : standardRoutes(targets, sse);

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
