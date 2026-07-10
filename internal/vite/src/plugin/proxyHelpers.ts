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
 * - platform 治理/版本/发布/系统 → :8090（默认 platform-console）
 * - 其余 `/api/**` → :8080（demo-camel-console）
 */
export function standardApiProxy(
  platformTarget = 'http://localhost:8090',
  consoleTarget = 'http://localhost:8080',
): Record<string, ProxyOptions> {
  return {
    '/api/system': simpleProxy(platformTarget),
    '/api/platform': simpleProxy(platformTarget),
    '/api/security/governance': simpleProxy(platformTarget),
    '/api/version': simpleProxy(platformTarget),
    '/api/release': simpleProxy(platformTarget),
    '/api/releases': simpleProxy(platformTarget),
    '/api/config': simpleProxy(platformTarget),
    '/api/task': simpleProxy(platformTarget),
    '/api': simpleProxy(consoleTarget),
  };
}
