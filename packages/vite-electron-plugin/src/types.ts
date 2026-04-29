import type { Plugin } from 'vite-plus';

export type SpawnCommand = {
  command: string;
  args: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
};

export type NebulaStudioElectronPluginOptions = {
  workspaceRoot?: string;
  electronCwd?: string;
  /** @deprecated Use frontendDevUrls instead */
  frontendDevUrl?: string;
  prebuildCommand?: SpawnCommand | false;
  startFrontendDevServer?: boolean;
  /** @deprecated Use frontendDevCommands instead */
  frontendDevCommand?: SpawnCommand;
  /** Multiple frontend dev servers (e.g., { main: "http://localhost:5173", settings: "http://localhost:5174" }) */
  frontendDevUrls?: Record<string, string>;
  /** Multiple frontend dev commands corresponding to frontendDevUrls keys */
  frontendDevCommands?: Record<string, SpawnCommand>;
  electronBuildCommand?: SpawnCommand;
  electronRuntimeCommand?: SpawnCommand;
  restartDebounceMs?: number;
  dependencyBuildCommands?: SpawnCommand[];
  waitForPaths?: string[];
};

export type VitePlugin = Plugin;
