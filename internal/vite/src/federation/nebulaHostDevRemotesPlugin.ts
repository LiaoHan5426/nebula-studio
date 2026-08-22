import type { Plugin } from 'vite';

import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';

import { resolveStandaloneApp } from '../config/studioRuntime.ts';
import {
  buildAppManifest,
  findMonorepoRoot,
  loadWindowsConfig,
} from '../config/windowsManifest.ts';

/** Keep in sync with `HOST_DEV_MF_GATEWAY_PREFIX` in application-runtime hostDevMf.ts */
export const HOST_DEV_MF_GATEWAY_PREFIX = '/__nebula-mf';

export interface FederationDevRemote {
  appDir: string;
  appId: string;
  configuredOrigin: string;
  packageName: string;
}

export function parseHostDevMfRequestUrl(
  url: string,
): null | { appId: string; rest: string } {
  const path = url.split('?')[0] ?? '';
  const prefix = `${HOST_DEV_MF_GATEWAY_PREFIX}/`;
  if (!path.startsWith(prefix)) return null;
  const after = path.slice(prefix.length);
  if (!after || after.includes('..')) return null;
  const slash = after.indexOf('/');
  if (slash === -1) {
    return { appId: after, rest: '/' };
  }
  return { appId: after.slice(0, slash), rest: after.slice(slash) };
}

export function isLikelyMfManifestJson(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed.startsWith('{')) return false;
  try {
    const json = JSON.parse(trimmed) as Record<string, unknown>;
    return Boolean(
      json.exposes || json.metaData || json.remoteEntry || json.id || json.name,
    );
  } catch {
    return false;
  }
}

export function collectFederationDevRemotes(
  rootDir?: string,
): FederationDevRemote[] {
  const root = rootDir ?? findMonorepoRoot(process.cwd());
  const windows = loadWindowsConfig(root);
  const manifest = buildAppManifest(windows, root);
  return manifest.federationSurfaces.map((appId) => {
    const standalone = resolveStandaloneApp(appId, windows);
    return {
      appId,
      packageName: `@nebula-studio-renderer/${appId}`,
      appDir: join(root, 'apps', 'sub-web', appId),
      configuredOrigin: `http://127.0.0.1:${standalone.port}`,
    };
  });
}

export async function probeMfManifest(origin: string): Promise<boolean> {
  const url = `${origin.replace(/\/$/, '')}/mf-manifest.json`;
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) return false;
    return isLikelyMfManifestJson(await response.text());
  } catch {
    return false;
  }
}

export async function reserveLoopbackPort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('[nebula-vite] failed to reserve a loopback port'));
        return;
      }
      const port = address.port;
      server.close((error) => {
        if (error) reject(error);
        else resolve(port);
      });
    });
  });
}

async function waitForMfManifest(
  origin: string,
  timeoutMs = 60_000,
): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await probeMfManifest(origin)) return;
    await new Promise((resolve) => {
      setTimeout(resolve, 400);
    });
  }
  throw new Error(
    `[nebula-vite] timed out waiting for ${origin}/mf-manifest.json`,
  );
}

export function resolveViteCli(fromDir: string): string {
  const require = createRequire(join(fromDir, 'package.json'));
  let current = dirname(require.resolve('vite'));
  while (true) {
    const candidate = join(current, 'bin', 'vite.js');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(current);
    if (parent === current) {
      throw new Error(`[nebula-vite] cannot resolve vite CLI from ${fromDir}`);
    }
    current = parent;
  }
}

function spawnRemoteVite(
  remote: FederationDevRemote,
  port: number,
): ChildProcess {
  const origin = `http://127.0.0.1:${port}`;
  const viteCli = resolveViteCli(remote.appDir);
  const child = spawn(
    process.execPath,
    [
      viteCli,
      'dev',
      '--port',
      String(port),
      '--strictPort',
      '--host',
      '127.0.0.1',
    ],
    {
      cwd: remote.appDir,
      env: {
        ...process.env,
        BROWSER: 'none',
        NEBULA_REMOTE_ORIGIN: origin,
        NEBULA_REMOTE_PORT: String(port),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    },
  );
  const prefix = `[${remote.appId}-remote]`;
  child.stdout?.on('data', (chunk: Buffer) => {
    process.stdout.write(`${prefix} ${chunk.toString()}`);
  });
  child.stderr?.on('data', (chunk: Buffer) => {
    process.stderr.write(`${prefix} ${chunk.toString()}`);
  });
  child.on('error', (error) => {
    console.error(
      `[nebula-vite] ${remote.appId} remote failed to start`,
      error,
    );
  });
  child.on('exit', (code, signal) => {
    if (code && code !== 0) {
      console.warn(
        `[nebula-vite] ${remote.appId} remote exited (${String(code)} ${signal ?? ''})`,
      );
    }
  });
  return child;
}

async function resolveRemoteOrigin(
  remote: FederationDevRemote,
  children: ChildProcess[],
  compose: boolean,
): Promise<string> {
  if (await probeMfManifest(remote.configuredOrigin)) {
    console.info(
      `[nebula-vite] reusing ${remote.appId} remote at ${remote.configuredOrigin}`,
    );
    return remote.configuredOrigin;
  }
  if (!compose) {
    throw new Error(
      `[nebula-vite] ${remote.appId} remote is not running at ${remote.configuredOrigin}`,
    );
  }
  const port = await reserveLoopbackPort();
  const origin = `http://127.0.0.1:${port}`;
  console.info(`[nebula-vite] starting ${remote.appId} remote at ${origin}`);
  const child = spawnRemoteVite(remote, port);
  children.push(child);
  await waitForMfManifest(origin);
  return origin;
}

function stopChildren(children: ChildProcess[]): void {
  for (const child of children) {
    if (child.killed || child.exitCode !== null) continue;
    child.kill();
  }
}

export function nebulaHostDevRemotesPlugin(): Plugin {
  return {
    name: 'nebula-host-dev-remotes',
    apply: 'serve',
    configureServer(server) {
      const compose = process.env.NEBULA_HOST_COMPOSE_REMOTES !== '0';
      const remotes = collectFederationDevRemotes(
        findMonorepoRoot(server.config.root),
      );
      const children: ChildProcess[] = [];
      const origins = new Map<string, Promise<string>>();
      for (const remote of remotes) {
        const pending = resolveRemoteOrigin(remote, children, compose);
        void pending.catch((error) => {
          console.error(error);
        });
        origins.set(remote.appId, pending);
      }

      server.httpServer?.once('close', () => {
        stopChildren(children);
      });

      server.middlewares.use((req, res, next) => {
        const parsed = parseHostDevMfRequestUrl(req.url ?? '');
        if (!parsed) {
          next();
          return;
        }
        const pending = origins.get(parsed.appId);
        if (!pending) {
          next();
          return;
        }
        void (async () => {
          try {
            const origin = await pending;
            const incoming = new URL(req.url ?? '/', 'http://127.0.0.1');
            const upstream = new URL(parsed.rest || '/', origin);
            upstream.search = incoming.search;
            const headers = new Headers();
            for (const [name, value] of Object.entries(req.headers)) {
              if (value === undefined || name === 'host') continue;
              headers.set(name, Array.isArray(value) ? value.join(',') : value);
            }
            const method = req.method ?? 'GET';
            const response = await fetch(upstream, {
              method,
              headers,
              redirect: 'manual',
            });
            res.statusCode = response.status;
            response.headers.forEach((value, name) => {
              if (name === 'transfer-encoding' || name === 'connection') return;
              res.setHeader(name, value);
            });
            res.end(Buffer.from(await response.arrayBuffer()));
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(
              JSON.stringify({
                error: `Host failed to reach ${parsed.appId} remote`,
                message,
              }),
            );
          }
        })();
      });
    },
  };
}
