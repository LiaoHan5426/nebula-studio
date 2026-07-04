declare global {
  interface Window {
    __NEBULA_RUNTIME_MODE__?: NebulaRuntimeMode;
  }
}

export type NebulaRuntimeMode = 'standalone' | 'platform-embed' | 'electron';
export type RuntimeMode = NebulaRuntimeMode;

/**
 * 检测运行时模式。
 *
 * 优先级：
 * 1. 宿主显式注入 `window.__NEBULA_RUNTIME_MODE__`（推荐，入口文件设置）
 * 2. `window.electron` 存在且非 Web stub → `'electron'`
 * 3. 默认 → `'standalone'`
 *
 * 业务代码不读 `location.search`。
 */
export function detectRuntimeMode(): RuntimeMode {
  // 1. 宿主显式注入
  const injected = window.__NEBULA_RUNTIME_MODE__;
  if (
    injected === 'platform-embed' ||
    injected === 'standalone' ||
    injected === 'electron'
  ) {
    return injected;
  }

  // 2. Electron preload 注入 window.electron；Web stub 会 markWebPresentationHost
  const hasElectron = Reflect.get(window, 'electron') !== undefined;
  const isWebStub = window.__NEBULA_PRESENTATION_HOST__ !== undefined;
  if (hasElectron && !isWebStub) {
    return 'electron';
  }

  // 3. 默认 standalone
  return 'standalone';
}
