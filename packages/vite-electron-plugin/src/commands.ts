import { setTimeout as delay } from 'node:timers/promises';
import type { SpawnCommand } from './types';
import { startCommand } from './process';
import { logWithTag } from './logger';

/**
 * 执行命令并等待完成
 */
export async function runCommandAndWait(
  command: SpawnCommand,
  name: string,
): Promise<void> {
  const child = startCommand(command, name);

  await new Promise<void>((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${name} exited with code ${String(code)}`));
    });
  });
}

/**
 * 等待 HTTP 服务就绪
 */
export async function waitForHttpReady(
  url: string,
  maxRetry = 60,
): Promise<void> {
  for (let retry = 0; retry < maxRetry; retry += 1) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return;
    } catch {
      await delay(500);
    }
  }

  throw new Error(`Failed to connect to frontend dev server: ${url}`);
}

/**
 * 检查 HTTP 服务是否可达
 */
export async function canReachHttp(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return true;
  } catch {
    return false;
  }
}

/**
 * 等待文件就绪
 */
export async function waitForFileReady(
  path: string,
  maxRetry = 120,
): Promise<void> {
  const { access } = await import('node:fs/promises');

  for (let retry = 0; retry < maxRetry; retry += 1) {
    try {
      await access(path);
      return;
    } catch {
      await delay(500);
    }
  }

  throw new Error(`Required file was not produced in time: ${path}`);
}

/**
 * 初始化前端开发服务器
 */
export async function initializeFrontendServers(
  frontendDevUrls: Record<string, string>,
  frontendDevCommands: Record<string, any>,
  _workspaceRoot: string,
): Promise<Map<string, any>> {
  const frontendProcesses = new Map<string, any>();

  for (const [key, devUrl] of Object.entries(frontendDevUrls)) {
    const frontendAlreadyRunning = await canReachHttp(devUrl);
    if (frontendAlreadyRunning) {
      logWithTag('frontend', `reuse existing server [${key}]: ${devUrl}`);
    } else {
      const devCommand = frontendDevCommands[key];
      if (devCommand) {
        const process = startCommand(devCommand, `frontend-${key}`);
        frontendProcesses.set(key, process);
      } else {
        logWithTag(
          'error',
          `missing frontend dev command for key: ${key}`,
          'stderr',
        );
      }
    }
  }

  return frontendProcesses;
}

/**
 * 启动依赖构建进程
 */
export function startDependencyBuilds(
  dependencyBuildCommands: SpawnCommand[],
): any[] {
  const processes: any[] = [];

  dependencyBuildCommands.forEach((command, index) => {
    const process = startCommand(command, `dependency-build-${index + 1}`);
    processes.push(process);
  });

  return processes;
}
