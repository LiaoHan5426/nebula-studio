import type { ProxyOptions } from 'vite';

import { createNebulaApiProxy } from '../proxy/createNebulaApiProxy.ts';

/**
 * 生成简单的代理配置（无 SSE 支持）。
 *
 * @param target - 后端目标 origin，必须来自 windows.json apiTargets
 */
export function simpleProxy (target: string): ProxyOptions {
  return { target, changeOrigin: true };
}

/**
 * 标准 API 代理配置，路由与 target 来自 configs/windows.json。
 */
export function standardApiProxy (
  platformTarget?: string,
  consoleTarget?: string,
): Record<string, ProxyOptions> {
  return createNebulaApiProxy({
    preset: 'standard',
    sse: false,
    targets: {
      ...(platformTarget ? { platform: platformTarget } : {}),
      ...(consoleTarget ? { console: consoleTarget } : {}),
    },
  });
}
