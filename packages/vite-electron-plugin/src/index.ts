import { createInterface } from 'node:readline';
import type { Interface as ReadlineInterface } from 'node:readline';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import type {
  SynraElectronPluginOptions,
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
 * 主插件导出
 */
export function synraElectronPlugin(
  options: SynraElectronPluginOptions = {},
): VitePlugin {
  /**
   * 拆分前端开发 URL 和命令的配置
   */
  function normalizeOptions(opts: SynraElectronPluginOptions) {
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
   * 创建电子运行命令配置
   */
  function createElectronRuntimeCommand(
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
   * 启动化和初始化状态管理
   */
  function createPluginState() {
    return {
      started: false,
      quitting: false,
      dependencyBuildProcesses: [] as ChildProcessWithoutNullStreams[],
      frontendProcesses: new Map<string, ChildProcessWithoutNullStreams>(),
      buildWatchProcess: null as ChildProcessWithoutNullStreams | null,
      electronRuntimeProcess: null as ChildProcessWithoutNullStreams | null,
      restartTimer: null as NodeJS.Timeout | null,
      restartInFlight: null as Promise<void> | null,
      commandLineInterface: null as ReadlineInterface | null,
      firstSuccessfulBuildReady: false,
      requestQuit: null as (() => void) | null,
      cleanupPromise: null as Promise<void> | null,
    };
  }

  /**
   * 重启电子应用的运行时
   */
  async function restartElectronRuntime(
    state: ReturnType<typeof createPluginState>,
    reason: 'initial' | 'rebuild',
    frontendDevUrls: Record<string, string>,
    electronRuntimeCommand: SpawnCommand,
    waitForPaths: string[],
    _restartDebounceMs: number,
  ): Promise<void> {
    if (state.restartInFlight) {
      return state.restartInFlight;
    }

    state.restartInFlight = (async () => {
      logWithTag('electron', `restart requested (${reason})`);
      stopProcess(state.electronRuntimeProcess);

      if (!state.firstSuccessfulBuildReady) {
        logWithTag(
          'info',
          'waiting for frontend and build outputs to be ready',
        );
        const httpChecks = Object.values(frontendDevUrls).map((url) =>
          waitForHttpReady(url),
        );
        await Promise.all([
          ...httpChecks,
          ...waitForPaths.map((path) => waitForFileReady(path)),
        ]);
        state.firstSuccessfulBuildReady = true;
        logWithTag('info', 'startup prerequisites ready');
      }

      const devServerUrlsEnv = JSON.stringify(frontendDevUrls);
      state.electronRuntimeProcess = startCommand(
        {
          ...electronRuntimeCommand,
          env: {
            ...electronRuntimeCommand.env,
            VITE_DEV_SERVER_URLS: devServerUrlsEnv,
            VITE_DEV_SERVER_URL: frontendDevUrls.main,
          },
        },
        'electron',
      );

      const currentRuntimeProcess = state.electronRuntimeProcess;
      currentRuntimeProcess.once('exit', async (code, signal) => {
        if (
          state.quitting ||
          currentRuntimeProcess !== state.electronRuntimeProcess
        ) {
          return;
        }

        logWithTag(
          'info',
          `electron runtime exited (code=${String(code)}, signal=${String(signal)}), shutting down dev runner`,
        );
        state.quitting = true;
        teardownInteractiveCommands(state);
        await cleanup(state);
        state.requestQuit?.();
      });
    })()
      .catch((error) => {
        logWithTag('error', String(error), 'stderr');
      })
      .finally(() => {
        state.restartInFlight = null;
      });

    return state.restartInFlight;
  }

  /**
   * 计划重启电子应用（带去抖）
   */
  function scheduleRestart(
    state: ReturnType<typeof createPluginState>,
    reason: 'initial' | 'rebuild',
    restartDebounceMs: number,
    frontendDevUrls: Record<string, string>,
    electronRuntimeCommand: SpawnCommand,
    waitForPaths: string[],
  ): void {
    if (state.restartTimer) {
      clearTimeout(state.restartTimer);
    }

    state.restartTimer = setTimeout(() => {
      void restartElectronRuntime(
        state,
        reason,
        frontendDevUrls,
        electronRuntimeCommand,
        waitForPaths,
        restartDebounceMs,
      );
    }, restartDebounceMs);
  }

  /**
   * 清理资源
   */
  async function cleanup(
    state: ReturnType<typeof createPluginState>,
  ): Promise<void> {
    if (state.cleanupPromise) {
      return state.cleanupPromise;
    }

    state.cleanupPromise = (async () => {
      if (state.restartTimer) {
        clearTimeout(state.restartTimer);
        state.restartTimer = null;
      }

      const processesToStop: Array<ChildProcessWithoutNullStreams | null> = [
        state.electronRuntimeProcess,
        state.buildWatchProcess,
        ...Array.from(state.frontendProcesses.values()),
        ...state.dependencyBuildProcesses,
      ];

      await stopMultipleProcesses(processesToStop);

      state.electronRuntimeProcess = null;
      state.buildWatchProcess = null;
      state.frontendProcesses.clear();
      state.dependencyBuildProcesses.length = 0;
      state.started = false;
    })().finally(() => {
      state.cleanupPromise = null;
    });

    return state.cleanupPromise;
  }

  /**
   * 关闭交互命令界面
   */
  function teardownInteractiveCommands(
    state: ReturnType<typeof createPluginState>,
  ): void {
    if (!state.commandLineInterface) {
      return;
    }

    state.commandLineInterface.close();
    state.commandLineInterface = null;
  }

  /**
   * 设置交互命令处理
   */
  function setupInteractiveCommands(
    state: ReturnType<typeof createPluginState>,
    onQuit: () => void,
    restartDebounceMs: number,
    frontendDevUrls: Record<string, string>,
    electronRuntimeCommand: SpawnCommand,
    waitForPaths: string[],
  ): void {
    if (!process.stdin.isTTY || state.commandLineInterface) {
      return;
    }

    state.commandLineInterface = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    logWithTag(
      'info',
      'commands: r + Enter (restart electron), q + Enter (quit)',
    );

    state.commandLineInterface.on('line', (line) => {
      const command = line.trim().toLowerCase();
      if (command === 'r') {
        void restartElectronRuntime(
          state,
          'rebuild',
          frontendDevUrls,
          electronRuntimeCommand,
          waitForPaths,
          restartDebounceMs,
        );
        return;
      }

      if (command !== 'q') {
        if (command.length > 0) {
          logWithTag('info', `unknown command: ${command}`);
        }
        return;
      }

      if (state.quitting) {
        return;
      }

      state.quitting = true;
      logWithTag('info', 'quit requested, shutting down child processes');
      teardownInteractiveCommands(state);
      void cleanup(state).finally(() => {
        onQuit();
      });
    });
  }

  const restartDebounceMs = options.restartDebounceMs ?? 200;
  const { frontendDevUrls, frontendDevCommands } = normalizeOptions(options);
  const electronRuntimeCommand = createElectronRuntimeCommand(
    options.electronRuntimeCommand,
    options.electronCwd ?? process.cwd(),
    frontendDevUrls,
  );
  const waitForPaths = options.waitForPaths ?? [];

  return {
    name: 'vite-plugin-synra-electron',
    apply: 'serve',
    configureServer(server) {
      const state = createPluginState();

      if (state.started) {
        return;
      }

      state.started = true;
      state.requestQuit = () => {
        const exitProcess = () => {
          setTimeout(() => {
            process.exit(0);
          }, 200).unref();
        };

        void cleanup(state).finally(() => {
          server.httpServer?.close(() => {
            exitProcess();
          });
          if (!server.httpServer) {
            exitProcess();
          }
        });
      };
      setupInteractiveCommands(
        state,
        () => {
          state.requestQuit?.();
        },
        restartDebounceMs,
        frontendDevUrls,
        electronRuntimeCommand,
        waitForPaths,
      );

      void startDevServer(state);

      server.httpServer?.once('close', () => {
        void cleanup(state);
      });
      process.once('SIGINT', () => {
        void cleanup(state);
      });
      process.once('SIGTERM', () => {
        void cleanup(state);
      });
      process.once('exit', () => {
        void cleanup(state);
      });
    },
  };

  /**
   * 启动开发服务器
   */
  async function startDevServer(
    state: ReturnType<typeof createPluginState>,
  ): Promise<void> {
    try {
      const prebuildCommand: SpawnCommand | false = options.prebuildCommand ?? {
        command: 'vp',
        args: ['run', 'capacitor-electron#build'],
        cwd: options.workspaceRoot ?? process.cwd(),
      };

      const electronBuildCommand: SpawnCommand =
        options.electronBuildCommand ?? {
          command: 'vp',
          args: [
            'exec',
            'tsc',
            '-p',
            'tsconfig.json',
            '--watch',
            '--preserveWatchOutput',
          ],
          cwd: options.electronCwd ?? process.cwd(),
        };

      if (prebuildCommand) {
        await runCommandAndWait(prebuildCommand, 'prebuild');
      }

      if (options.startFrontendDevServer ?? true) {
        const processes = await initializeFrontendServers(
          frontendDevUrls,
          frontendDevCommands,
          options.workspaceRoot ?? process.cwd(),
        );
        processes.forEach((process, key) => {
          state.frontendProcesses.set(key, process);
        });
      }

      const dependencyBuildCommands = options.dependencyBuildCommands ?? [];
      state.dependencyBuildProcesses.push(
        ...startDependencyBuilds(dependencyBuildCommands),
      );

      state.buildWatchProcess = startCommand(
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
          const reason: 'initial' | 'rebuild' = state.firstSuccessfulBuildReady
            ? 'rebuild'
            : 'initial';
          scheduleRestart(
            state,
            reason,
            restartDebounceMs,
            frontendDevUrls,
            electronRuntimeCommand,
            waitForPaths,
          );
        }
      };
      state.buildWatchProcess.stdout.on('data', handleBuildOutput);
      state.buildWatchProcess.stderr.on('data', handleBuildOutput);
    } catch (error) {
      logWithTag('error', String(error), 'stderr');
      void cleanup(state);
    }
  }
}

export const crossCraftElectronPlugin = synraElectronPlugin;

export default crossCraftElectronPlugin;
