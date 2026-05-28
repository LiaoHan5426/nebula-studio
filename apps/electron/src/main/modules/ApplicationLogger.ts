import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { app } from 'electron';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export class ApplicationLogger {
  readonly #logFilePath: string;
  readonly #configuredLogDir?: string;

  constructor(options?: { configuredLogDir?: string }) {
    this.#configuredLogDir = options?.configuredLogDir;
    this.#logFilePath = this.#resolveWritableLogPath();
  }

  info(message: string): void {
    this.#write('INFO', message);
  }

  warn(message: string): void {
    this.#write('WARN', message);
  }

  error(message: string, error?: unknown): void {
    const detail = error ? `\n${this.#stringifyError(error)}` : '';
    this.#write('ERROR', `${message}${detail}`);
  }

  getLogFilePath(): string {
    return this.#logFilePath;
  }

  #write(level: LogLevel, message: string): void {
    const line = `${new Date().toISOString()} [${level}] ${message}\n`;
    if (level === 'ERROR') {
      console.error(`[main] ${message}`);
    } else if (level === 'WARN') {
      console.warn(`[main] ${message}`);
    } else {
      console.info(`[main] ${message}`);
    }

    try {
      appendFileSync(this.#logFilePath, line, 'utf-8');
    } catch (error) {
      // Final fallback to console only; avoid crash when filesystem is unavailable.
      console.error('[main] Failed writing log file.', error);
    }
  }

  #resolveWritableLogPath(): string {
    const now = new Date();
    const fileName = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.log`;

    const execSiblingLogsDir = join(dirname(process.execPath), 'logs');
    const resourcesSiblingLogsDir = join(
      dirname(process.resourcesPath),
      'logs',
    );
    const appPathLogsDir = join(app.getAppPath(), 'public', 'logs');
    const userDataLogsDir = join(app.getPath('userData'), 'logs');
    const envLogsDir = process.env.NEBULA_LOG_DIR;
    const configLogsDir = this.#configuredLogDir;
    const candidates = app.isPackaged
      ? [
          // Highest priority for installed app.
          execSiblingLogsDir,
          resourcesSiblingLogsDir,
          envLogsDir,
          configLogsDir,
          userDataLogsDir,
        ]
      : [envLogsDir, configLogsDir, appPathLogsDir, userDataLogsDir];
    const dedupedCandidates = [...new Set(candidates)].filter(
      (v): v is string => Boolean(v),
    );

    for (const dir of dedupedCandidates) {
      const filePath = join(dir, fileName);
      try {
        mkdirSync(dirname(filePath), { recursive: true });
        appendFileSync(filePath, '', 'utf-8');
        return filePath;
      } catch {
        // Try next candidate.
      }
    }

    // Last-resort fallback path.
    const fallback = join(process.cwd(), 'logs', fileName);
    mkdirSync(dirname(fallback), { recursive: true });
    return fallback;
  }

  #stringifyError(error: unknown): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}\n${error.stack ?? ''}`.trimEnd();
    }
    return typeof error === 'string' ? error : JSON.stringify(error);
  }
}
