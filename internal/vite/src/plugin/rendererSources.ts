import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';

export interface RendererSource {
  /** Renderer name as used in `@nebula-studio-renderer/{name}`. */
  rendererName: string;
  /** Actual directory name under `sub-web/`. */
  dirName: string;
  /** Absolute path to the renderer's `src` directory. */
  srcPath: string;
}

/**
 * 从 `configs/windows.json` 的 `rendererSources` 字段解析各 renderer 源码目录。
 *
 * @param callerUrl - 调用方的 `import.meta.url`，用于定位 monorepo 根目录
 */
export function resolveRendererSources(callerUrl: string): RendererSource[] {
  const callerDir = dirname(fileURLToPath(callerUrl));
  // configs/windows.json 相对于 apps/web 或 apps/electron 的位置
  const configPath = join(callerDir, '..', '..', 'configs', 'windows.json');
  const raw = readFileSync(configPath, 'utf-8');
  const config = JSON.parse(raw) as {
    rendererSources?: Record<string, string>;
  };

  return Object.entries(config.rendererSources ?? {}).map(([name, dir]) => ({
    rendererName: name,
    dirName: dir,
    srcPath: fileURLToPath(
      new URL(`../sub-web/${dir}/src`, pathToFileURL(`${callerDir}/`)),
    ),
  }));
}
