import './assets/main.css';
import { bootFrontend } from './boot';

// Electron 由 preload/bridge 注入 window.electron；
// Web standalone 无 window.electron，默认 standalone。
if (!window.__NEBULA_RUNTIME_MODE__) {
  window.__NEBULA_RUNTIME_MODE__ =
    typeof (window as any).electron !== 'undefined' ? 'electron' : 'standalone';
}

void bootFrontend();
