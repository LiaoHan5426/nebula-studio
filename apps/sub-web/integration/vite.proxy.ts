import type { ProxyOptions } from 'vite';

function isSseRequest(url?: string): boolean {
  return url?.includes('/events') ?? false;
}

function configureSseProxy(proxy: any) {
  proxy.on('proxyRes', (proxyRes: any, req: any) => {
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

function withSse(target: string): ProxyOptions {
  return {
    target,
    changeOrigin: true,
    timeout: 0,
    proxyTimeout: 0,
    configure: configureSseProxy,
  };
}

/**
 * 集成平台代理配置：
 * - executor 路径 → :8081
 * - platform / 治理 / 版本 / 发布 → :8090 / :8080
 * - 其余 /api → :8080
 */
export const proxy: Record<string, ProxyOptions> = {
  '/api/integration/gateway': withSse('http://localhost:8081'),
  '/api/integration/demo': withSse('http://localhost:8081'),
  '/api/executor': withSse('http://localhost:8081'),
  '/api/system': withSse('http://localhost:8090'),
  '/api/platform': withSse('http://localhost:8090'),
  '/api/security/governance': withSse('http://localhost:8090'),
  '/api/version': withSse('http://localhost:8090'),
  '/api/release': withSse('http://localhost:8090'),
  '/api/releases': withSse('http://localhost:8090'),
  '/api': withSse('http://localhost:8080'),
};
