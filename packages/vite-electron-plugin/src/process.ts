import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import type { SpawnCommand } from './types';
import { logWithTag, pipeWithTag } from './logger';

/**
 * 启动命令并返回子进程
 */
export function startCommand(
  command: SpawnCommand,
  name: string,
): ChildProcessWithoutNullStreams {
  logWithTag(name, `start: ${command.command} ${command.args.join(' ')}`);

  const processToStart =
    process.platform === 'win32'
      ? spawn('cmd.exe', ['/d', '/s', '/c', command.command, ...command.args], {
          cwd: command.cwd,
          env: { ...process.env, ...command.env },
          stdio: 'pipe',
          shell: false,
        })
      : spawn(command.command, command.args, {
          cwd: command.cwd,
          env: { ...process.env, ...command.env },
          stdio: 'pipe',
          detached: true,
          shell: false,
        });

  pipeWithTag(processToStart, name, 'stdout');
  pipeWithTag(processToStart, name, 'stderr');

  return processToStart;
}

/**
 * 停止进程（使用 SIGTERM/SIGKILL）
 */
export function stopProcess(
  child: ChildProcessWithoutNullStreams | null,
): void {
  if (!child || child.killed) {
    return;
  }

  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
      stdio: 'ignore',
      shell: false,
    });
    return;
  }

  const { pid } = child;
  if (typeof pid !== 'number') {
    child.kill('SIGTERM');
    return;
  }

  try {
    process.kill(-pid, 'SIGTERM');
  } catch {
    child.kill('SIGTERM');
  }

  setTimeout(() => {
    if (child.killed || child.exitCode !== null) {
      return;
    }

    try {
      process.kill(-pid, 'SIGKILL');
    } catch {
      child.kill('SIGKILL');
    }
  }, 1500).unref();
}

/**
 * 停止进程并等待其退出
 */
export async function stopProcessAndWait(
  child: ChildProcessWithoutNullStreams | null,
  timeoutMs = 5000,
): Promise<void> {
  if (!child) {
    return;
  }
  if (child.killed || child.exitCode !== null) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeoutId = setTimeout(() => {
      child.removeListener('exit', onExit);
      resolve();
    }, timeoutMs);

    const onExit = () => {
      clearTimeout(timeoutId);
      resolve();
    };

    child.once('exit', onExit);
    stopProcess(child);
  });
}

/**
 * 停止多个进程
 */
export async function stopMultipleProcesses(
  processes: (ChildProcessWithoutNullStreams | null)[],
): Promise<void> {
  await Promise.all(processes.map((p) => stopProcessAndWait(p)));
}
