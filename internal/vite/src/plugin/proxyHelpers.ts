import type { ProxyOptions } from 'vite';

/**
 * 生成简单的代理配置（无 SSE 支持）。
 *
 * @param target - 后端目标地址，如 `'http://localhost:8080'`
 */
export function simpleProxy(target: string): ProxyOptions {
  return { target, changeOrigin: true };
}

/**
 * 标准 API 代理配置：
 * - `/api/system/**` → platform（默认 :8090）
 * - `/api/**`        → console（默认 :8080）
 *
 * 适用于 frontend / login / settings / docs 等非集成平台子应用。
 */
export function standardApiProxy(
  platformTarget = 'http://localhost:8090',
  consoleTarget = 'http://localhost:8080',
): Record<string, ProxyOptions> {
  return {
    '/api/system': simpleProxy(platformTarget),
    '/api': simpleProxy(consoleTarget),
  };
}
