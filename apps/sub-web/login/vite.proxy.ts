import type { ProxyOptions } from 'vite';

import { standardApiProxy } from '@nebula-studio-internal/vite';

/** 标准代理配置来自 configs/windows.json apiProxy.presets.standard。 */
export const proxy: Record<string, ProxyOptions> = standardApiProxy();
