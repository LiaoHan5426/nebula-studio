import type { ProxyOptions } from 'vite';

function isSseRequest(url?: string): boolean {
  return url?.includes('/events') ?? false;
}

/** Dev /api proxy — REST and SSE share same origin to satisfy page CSP. */
export function integrationApiProxy(): Record<string, ProxyOptions> {
  return {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      timeout: 0,
      proxyTimeout: 0,
      configure: (proxy) => {
        proxy.on('proxyRes', (proxyRes, req) => {
          if (!isSseRequest(req.url)) {
            return;
          }
          delete proxyRes.headers['content-length'];
          proxyRes.headers['cache-control'] = 'no-cache';
          proxyRes.headers['connection'] = 'keep-alive';
          proxyRes.headers['x-accel-buffering'] = 'no';
        });
        proxy.on('error', (err, req, res) => {
          if (isSseRequest(req.url)) {
            if (res && !res.headersSent) {
              res.writeHead(502);
            }
            res?.end();
            return;
          }
          console.error('[vite] http proxy error:', req.url, err);
        });
      },
    },
  };
}
