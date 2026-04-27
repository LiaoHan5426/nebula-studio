import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import type { LoggerInstance } from '@nebula-studio/utils';

import { createLogger } from '@nebula-studio/utils';

const LEADING_TAG_RE = /^\s*\[[^\]]+\]\s/;
const loggerRegistry = new Map<string, LoggerInstance>();

/**
 * 移除字符串开头的 ANSI 转义码
 */
export function stripLeadingAnsi(text: string): string {
  let cursor = 0;
  while (text.charCodeAt(cursor) === 27 && text[cursor + 1] === '[') {
    const ansiEnd = text.indexOf('m', cursor + 2);
    if (ansiEnd === -1) {
      break;
    }
    cursor = ansiEnd + 1;
  }

  return text.slice(cursor);
}

function getTagLogger(tag: string): LoggerInstance {
  if (loggerRegistry.has(tag)) {
    return loggerRegistry.get(tag) as LoggerInstance;
  }
  const createdLogger = createLogger(`vite-electron:${tag}`);
  loggerRegistry.set(tag, createdLogger);
  return createdLogger;
}

/**
 * 使用标签输出日志
 */
export function logWithTag(
  tag: string,
  message: string,
  type: 'stdout' | 'stderr' = 'stdout',
): void {
  const logger = getTagLogger(tag);
  if (type === 'stderr') {
    logger.error(message);
    return;
  }
  if (tag === 'info') {
    logger.info(message);
    return;
  }
  logger.success(message);
}

/**
 * 将子进程输出通过标签管道化
 */
export function pipeWithTag(
  child: ChildProcessWithoutNullStreams,
  tag: string,
  type: 'stdout' | 'stderr',
): void {
  const source = type === 'stderr' ? child.stderr : child.stdout;

  source.on('data', (chunk) => {
    const text = String(chunk);
    const lines = text.split(/(\r?\n)/);
    const normalizedText = lines
      .map((segment) => {
        if (segment === '\n' || segment === '\r\n' || segment.length === 0) {
          return segment;
        }

        // Skip adding parent tag if child already emits "[tag]" prefix.
        if (LEADING_TAG_RE.test(stripLeadingAnsi(segment))) {
          return segment;
        }

        return `${segment}`;
      })
      .join('');
    const normalizedLines = normalizedText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    for (const line of normalizedLines) {
      logWithTag(tag, line, type);
    }
  });
}
