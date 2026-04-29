import { createInterface } from 'node:readline';
import type { Interface as ReadlineInterface } from 'node:readline';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import type {
  NebulaStudioElectronPluginOptions,
  SpawnCommand,
  VitePlugin,
} from './types';
import { logWithTag } from './logger';
import { startCommand, stopProcess, stopMultipleProcesses } from './process';
import {
  runCommandAndWait,
  waitForHttpReady,
  waitForFileReady,
  initializeFrontendServers,
  startDependencyBuilds,
} from './commands';

/**
 * 插件状态定义
 */
export interface PluginState {
  started: boolean;
  quitting: boolean;
  dependencyBuildProcesses: ChildProcessWithoutNullStreams[];
  frontendProcesses: Map<string, ChildProcessWithoutNullStreams>;
  buildWatchProcess: ChildProcessWithoutNullStreams | null;
  electronRuntimeProcess: ChildProcessWithoutNullStreams | null;
  restartTimer: NodeJS.Timeout | null;
  restartInFlight: Promise<void> | null;
  commandLineInterface: ReadlineInterface | null;
  firstSuccessfulBuildReady: boolean;
  requestQuit: (() => void) | null;
  cleanupPromise: Promise<void> | null;
}

/**
 * Nebula Studio Electron 插件控制器
 */
export class NebulaStudioElectronPluginController {
  private state: PluginState;
  private options: NebulaStudioElectronPluginOptions;
  private frontendDevUrls: Record<string, string>;
  private frontendDevCommands: Record<string, SpawnCommand>;
  private electronRuntimeCommand: SpawnCommand;
  private waitForPaths: string[];
  private restartDebounceMs: number;

  constructor(options: NebulaStudioElectronPluginOptions = {}) {
    this.options = options;
    this.restartDebounceMs = options.restartDebounceMs ?? 200;
    this.waitForPaths = options.waitForPaths ?? [];
    this.state = this.createPluginState();

    // 规范化配置
    const normalized = this.normalizeOptions(options);
    this.frontendDevUrls = normalized.frontendDevUrls;
    this.frontendDevCommands = normalized.frontendDevCommands;
    this.electronRuntimeCommand = this.createElectronRuntimeCommand(
      options.electronRuntimeCommand,
      options.electronCwd ?? process.cwd(),
      this.frontendDevUrls,
    );
  }

  /**
   * 规范化选项配置
   */
  private normalizeOptions(opts: NebulaStudioElectronPluginOptions) {
    const frontendDevUrls: Record<string, string> = opts.frontendDevUrls ?? {
      main: opts.frontendDevUrl ?? 'http://localhost:5173',
    };

    const frontendDevCommands: Record<string, SpawnCommand> =
      opts.frontendDevCommands ?? {
        main: opts.frontendDevCommand ?? {
          command: 'vp',
          args: ['run', 'frontend#dev'],
          cwd: opts.workspaceRoot ?? process.cwd(),
        },
      };

    return { frontendDevUrls, frontendDevCommands };
  }

  /**
   * 创建 Electron 运行时命令配置
   */
  private createElectronRuntimeCommand(
    baseCommand: SpawnCommand | undefined,
    electronCwd: string,
    frontendDevUrls: Record<string, string>,
  ): SpawnCommand {
    const devServerUrlsEnv = JSON.stringify(frontendDevUrls);

    return (
      baseCommand ?? {
        command: 'vp',
        args: ['exec', 'electron', './dist/src/main.js'],
        cwd: electronCwd,
        env: {
          VITE_DEV_SERVER_URLS: devServerUrlsEnv,
          VITE_DEV_SERVER_URL: frontendDevUrls.main,
        },
      }
    );
  }

  /**
   * 初始化插件状态
   */
  private createPluginState(): PluginState {
    return {
      started: false,
      quitting: false,
      dependencyBuildProcesses: [],
      frontendProcesses: new Map(),
      buildWatchProcess: null,
      electronRuntimeProcess: null,
      restartTimer: null,
      restartInFlight: null,
      commandLineInterface: null,
      firstSuccessfulBuildReady: false,
      requestQuit: null,
      cleanupPromise: null,
    };
  }

  /**
   * 重启 Electron 运行时
   */
  private async restartElectronRuntime(
    reason: 'initial' | 'rebuild',
  ): Promise<void> {
    if (this.state.restartInFlight) {
      return this.state.restartInFlight;
    }

    this.state.restartInFlight = (async () => {
      logWithTag('electron', `restart requested (${reason})`);
      stopProcess(this.state.electronRuntimeProcess);

      if (!this.state.firstSuccessfulBuildReady) {
        logWithTag(
          'info',
          'waiting for frontend and build outputs to be ready',
        );
        const httpChecks = Object.values(this.frontendDevUrls).map((url) =>
          waitForHttpReady(url),
        );
        await Promise.all([
          ...httpChecks,
          ...this.waitForPaths.map((path) => waitForFileReady(path)),
        ]);
        this.state.firstSuccessfulBuildReady = true;
        logWithTag('info', 'startup prerequisites ready');
      }

      const devServerUrlsEnv = JSON.stringify(this.frontendDevUrls);
      this.state.electronRuntimeProcess = startCommand(
        {
          ...this.electronRuntimeCommand,
          env: {
            ...this.electronRuntimeCommand.env,
            VITE_DEV_SERVER_URLS: devServerUrlsEnv,
            VITE_DEV_SERVER_URL: this.frontendDevUrls.main,
          },
        },
        'electron',
      );

      const currentRuntimeProcess = this.state.electronRuntimeProcess;
      currentRuntimeProcess.once('exit', async (code, signal) => {
        if (
          this.state.quitting ||
          currentRuntimeProcess !== this.state.electronRuntimeProcess
        ) {
          return;
        }

        logWithTag(
          'info',
          `electron runtime exited (code=${String(code)}, signal=${String(signal)}), shutting down dev runner`,
        );
        this.state.quitting = true;
        this.teardownInteractiveCommands();
        await this.cleanup();
        this.state.requestQuit?.();
      });
    })()
      .catch((error) => {
        logWithTag('error', String(error), 'stderr');
      })
      .finally(() => {
        this.state.restartInFlight = null;
      });

    return this.state.restartInFlight;
  }

  /**
   * 计划重启 Electron（带去抖）
   */
  private scheduleRestart(reason: 'initial' | 'rebuild'): void {
    if (this.state.restartTimer) {
      clearTimeout(this.state.restartTimer);
    }

    this.state.restartTimer = setTimeout(() => {
      void this.restartElectronRuntime(reason);
    }, this.restartDebounceMs);
  }

  /**
   * 清理资源
   */
  private async cleanup(): Promise<void> {
    if (this.state.cleanupPromise) {
      return this.state.cleanupPromise;
    }

    this.state.cleanupPromise = (async () => {
      if (this.state.restartTimer) {
        clearTimeout(this.state.restartTimer);
        this.state.restartTimer = null;
      }

      const processesToStop: Array<ChildProcessWithoutNullStreams | null> = [
        this.state.electronRuntimeProcess,
        this.state.buildWatchProcess,
        ...Array.from(this.state.frontendProcesses.values()),
        ...this.state.dependencyBuildProcesses,
      ];

      await stopMultipleProcesses(processesToStop);

      this.state.electronRuntimeProcess = null;
      this.state.buildWatchProcess = null;
      this.state.frontendProcesses.clear();
      this.state.dependencyBuildProcesses.length = 0;
      this.state.started = false;
    })().finally(() => {
      this.state.cleanupPromise = null;
    });

    return this.state.cleanupPromise;
  }

  /**
   * 关闭交互命令界面
   */
  private teardownInteractiveCommands(): void {
    if (!this.state.commandLineInterface) {
      return;
    }

    this.state.commandLineInterface.close();
    this.state.commandLineInterface = null;
  }

  /**
   * 设置交互命令处理
   */
  private setupInteractiveCommands(onQuit: () => void): void {
    if (!process.stdin.isTTY || this.state.commandLineInterface) {
      return;
    }

    this.state.commandLineInterface = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    logWithTag(
      'info',
      'commands: r + Enter (restart electron), q + Enter (quit)',
    );

    this.state.commandLineInterface.on('line', (line) => {
      const command = line.trim().toLowerCase();
      if (command === 'r') {
        void this.restartElectronRuntime('rebuild');
        return;
      }

      if (command !== 'q') {
        if (command.length > 0) {
          logWithTag('info', `unknown command: ${command}`);
        }
        return;
      }

      if (this.state.quitting) {
        return;
      }

      this.state.quitting = true;
      logWithTag('info', 'quit requested, shutting down child processes');
      this.teardownInteractiveCommands();
      void this.cleanup().finally(() => {
        onQuit();
      });
    });
  }

  /**
   * 启动开发服务器
   */
  private async startDevServer(): Promise<void> {
    try {
      const prebuildCommand: SpawnCommand | false = this.options
        .prebuildCommand ?? {
        command: 'vp',
        args: ['run', 'capacitor-electron#build'],
        cwd: this.options.workspaceRoot ?? process.cwd(),
      };

      const electronBuildCommand: SpawnCommand = this.options
        .electronBuildCommand ?? {
        command: 'vp',
        args: [
          'exec',
          'tsc',
          '-p',
          'tsconfig.json',
          '--watch',
          '--preserveWatchOutput',
        ],
        cwd: this.options.electronCwd ?? process.cwd(),
      };

      if (prebuildCommand) {
        await runCommandAndWait(prebuildCommand, 'prebuild');
      }

      if (this.options.startFrontendDevServer ?? true) {
        const processes = await initializeFrontendServers(
          this.frontendDevUrls,
          this.frontendDevCommands,
          this.options.workspaceRoot ?? process.cwd(),
        );
        processes.forEach((process, key) => {
          this.state.frontendProcesses.set(key, process);
        });
      }

      const dependencyBuildCommands =
        this.options.dependencyBuildCommands ?? [];
      this.state.dependencyBuildProcesses.push(
        ...startDependencyBuilds(dependencyBuildCommands),
      );

      this.state.buildWatchProcess = startCommand(
        electronBuildCommand,
        'electron-build',
      );
      const handleBuildOutput = (chunk: unknown) => {
        const text = String(chunk);
        if (
          /Found 0 errors?\./.test(text) ||
          /watch(ing)? for changes/i.test(text) ||
          /build finished/i.test(text)
        ) {
          const reason: 'initial' | 'rebuild' = this.state
            .firstSuccessfulBuildReady
            ? 'rebuild'
            : 'initial';
          this.scheduleRestart(reason);
        }
      };
      this.state.buildWatchProcess.stdout.on('data', handleBuildOutput);
      this.state.buildWatchProcess.stderr.on('data', handleBuildOutput);
    } catch (error) {
      logWithTag('error', String(error), 'stderr');
      void this.cleanup();
    }
  }

  /**
   * 创建 Vite 插件对象
   */
  createPlugin(): VitePlugin {
    return {
      name: 'vite-plugin-nebula-studio-electron',
      apply: 'serve',
      configureServer: (server) => {
        if (this.state.started) {
          return;
        }

        this.state.started = true;
        this.state.requestQuit = () => {
          const exitProcess = () => {
            setTimeout(() => {
              process.exit(0);
            }, 200).unref();
          };

          void this.cleanup().finally(() => {
            server.httpServer?.close(() => {
              exitProcess();
            });
            if (!server.httpServer) {
              exitProcess();
            }
          });
        };

        this.setupInteractiveCommands(() => {
          this.state.requestQuit?.();
        });

        void this.startDevServer();

        server.httpServer?.once('close', () => {
          void this.cleanup();
        });
        process.once('SIGINT', () => {
          void this.cleanup();
        });
        process.once('SIGTERM', () => {
          void this.cleanup();
        });
        process.once('exit', () => {
          void this.cleanup();
        });
      },
    };
  }
}
