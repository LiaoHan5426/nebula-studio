import type { NebulaStudioElectronPluginOptions, VitePlugin } from './types';
import { NebulaStudioElectronPluginController } from './controller';

/**
 * 创建 Nebula Studio Electron 插件
 */
export function nebulaStudioElectronPlugin(
  options: NebulaStudioElectronPluginOptions = {},
): VitePlugin {
  const controller = new NebulaStudioElectronPluginController(options);
  return controller.createPlugin();
}

export default nebulaStudioElectronPlugin;
