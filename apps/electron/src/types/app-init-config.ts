import type { WindowConfig } from '../modules/windows/WindowManagerHelper';

export interface AppInitConfig extends WindowConfig {
  windows: Record<string, WindowConfig>;
}
