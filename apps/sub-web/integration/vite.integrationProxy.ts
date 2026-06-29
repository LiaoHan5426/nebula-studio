import type { ProxyOptions } from 'vite';

const PLATFORM_TARGET = 'http://localhost:8090';
const CONSOLE_TARGET = 'http://localhost:8080';
const EXECUTOR_TARGET = 'http://localhost:8081';

function isSseRequest(url?: string): boolean {
  return url?.includes('/events') ?? false;
}

function configureSseProxy(proxy: any) {
  proxy.on('proxyRes', (proxyRes: any, req: any) => {
    const res = proxyRes as {
      headers: Record<string, string | string[] | undefined>;
    };
    const request = req as { url?: string };
    if (!isSseRequest(request.url)) {
      return;
    }
    delete res.headers['content-length'];
    res.headers['cache-control'] = 'no-cache';
    res.headers['connection'] = 'keep-alive';
    res.headers['x-accel-buffering'] = 'no';
  });
  proxy.on('error', (err: any, req: any, res: any) => {
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
    console.error('[vite] http proxy error:', request.url, err);
  });
}

function proxyOptions(target: string): ProxyOptions {
  return {
    target,
    changeOrigin: true,
    timeout: 0,
    proxyTimeout: 0,
    configure: configureSseProxy,
  };
}

/**
 * Dev proxy: executor paths → :8081, everything else under /api → console :8080.
 */
export function integrationApiProxy(): Record<string, ProxyOptions> {
  return {
    '/api/integration/gateway': proxyOptions(EXECUTOR_TARGET),
    '/api/integration/demo': proxyOptions(EXECUTOR_TARGET),
    '/api/executor': proxyOptions(EXECUTOR_TARGET),
    // system 路径 → :8090 (platform-console)
    '/api/system': proxyOptions(PLATFORM_TARGET),
    // 其余 /api → :8080 (camel-console)
    '/api': proxyOptions(CONSOLE_TARGET),
  };
}

/**
 * Simple proxy options (no SSE support).
 *
 * Used by frontend / settings / login sub-web apps.
 */
function simpleProxyOptions(target: string): ProxyOptions {
  return {
    target,
    changeOrigin: true,
  };
}

/**
 * Dev proxy for non-integration sub-web apps (frontend, settings, login).
 *
 * - `/api/system/**` → :8090 (platform-console)
 * - `/api/**`        → :8080 (camel-console)
 */
export function nebulaApiProxy(): Record<string, ProxyOptions> {
  return {
    '/api/system': simpleProxyOptions(PLATFORM_TARGET),
    '/api': simpleProxyOptions(CONSOLE_TARGET),
  };
}
