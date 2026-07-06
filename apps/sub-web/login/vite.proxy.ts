import type { ProxyOptions } from 'vite';
import { standardApiProxy } from '@nebula-studio-internal/vite';

/**
 * 标准代理配置：
 * - `/api/system/**` → :8090 (platform)
 * - `/api/**`        → :8080 (console)
 */
export const proxy: Record<string, ProxyOptions> = standardApiProxy();
