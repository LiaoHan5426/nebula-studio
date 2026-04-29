import type { Plugin } from 'vite-plus';

export type SpawnCommand = {
  command: string;
  args: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
};

export type NebulaStudioElectronPluginOptions = {
  workspaceRoot?: string;
  /**
   * Electron 应用的工作目录，通常是 apps/electron
   * 如果提供了 appConfigPath，会自动从 app.config.ts 中推导此值
   */
  electronCwd?: string;
  /**
   * app.config.ts 的路径（相对于 workspaceRoot）
   * 如果提供，将自动读取窗口配置和目录结构
   */
  appConfigPath?: string;

  /* ============ 自动生成的选项（当提供 appConfigPath 时会自动设置） ============ */
  /**
   * 前端开发服务器 URLs 映射 (key: 窗口名称, value: URL)
   * 自动生成的选项，可以手动覆盖
   */
  frontendDevUrls?: Record<string, string>;
  /** 前端开发命令映射 */
  frontendDevCommands?: Record<string, SpawnCommand>;

  /* ============ 自定义命令 ============ */
  /** 构建依赖的前置命令 */
  prebuildCommand?: SpawnCommand | false;
  /** 是否启动前端开发服务器（通常应为 true） */
  startFrontendDevServer?: boolean;
  /** Electron 构建监听命令 */
  electronBuildCommand?: SpawnCommand;
  /** Electron 运行时命令 */
  electronRuntimeCommand?: SpawnCommand;
  /** 依赖项构建命令列表 */
  dependencyBuildCommands?: SpawnCommand[];

  /* ============ 配置 ============ */
  /** 重启防抖时间（毫秒） */
  restartDebounceMs?: number;
  /** 需要等待的文件路径 */
  waitForPaths?: string[];

  /** @deprecated Use frontendDevUrls instead */
  frontendDevUrl?: string;
  /** @deprecated Use frontendDevCommands instead */
  frontendDevCommand?: SpawnCommand;
};

export type AppConfigStructure = {
  dirs?: {
    electron?: string;
    preload?: string;
  };
  windows?: Record<string, string>;
  build?: {
    appName?: string;
    appVersion?: string;
    appBuildNumber?: number;
    apiVersion?: string;
  };
};

export type VitePlugin = Plugin;
