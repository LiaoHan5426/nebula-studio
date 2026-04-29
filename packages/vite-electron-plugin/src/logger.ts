import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import type { LoggerInstance } from '@nebula-studio/utils';

import { createLogger } from '@nebula-studio/utils';

const LEADING_TAG_RE = /^\s*\[[^\]]+\]\s/;
const TAG_EXTRACT_RE = /\[nebula-studio:([^\]]+)\]/;
const loggerRegistry = new Map<string, LoggerInstance>();

/**
 * 从消息中提取内嵌的 tag 和清理消息
 */
function extractTagAndMessage(message: string): {
  tag: string | null;
  message: string;
} {
  let cleanMessage = message.trim();
  let extractedTag: string | null = null;

  // 移除日志图标前缀（✔、ℹ、⚠、✖ 等）
  cleanMessage = cleanMessage.replace(/^[\s\w]*[\s✔ℹ⚠✖]\s+/, '');

  // 提取 [nebula-studio:tag-name] 格式的 tag
  const tagMatch = cleanMessage.match(TAG_EXTRACT_RE);
  if (tagMatch) {
    extractedTag = tagMatch[1];
  }

  // 移除 [tag] 格式的内嵌 tag 前缀
  cleanMessage = cleanMessage.replace(LEADING_TAG_RE, '');

  return { tag: extractedTag, message: cleanMessage.trim() };
}

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
  // 直接使用 tag 创建 logger，createLogger 会自动添加 nebula-studio: 前缀
  const createdLogger = createLogger(tag);
  loggerRegistry.set(tag, createdLogger);
  return createdLogger;
}

/**
 * 判断消息是否为错误类型
 */
function isErrorMessage(message: string): boolean {
  const errorPatterns = [
    /error/i,
    /fail/i,
    /exception/i,
    /fatal/i,
    /critical/i,
  ];
  return errorPatterns.some((pattern) => pattern.test(message));
}

/**
 * 使用标签输出日志
 */
export function logWithTag(
  tag: string,
  message: string,
  type: 'stdout' | 'stderr' = 'stdout',
): void {
  // 提取消息中的 tag 和清理后的消息内容
  const { tag: extractedTag, message: cleanMessage } =
    extractTagAndMessage(message);

  // 组合 tag：如果消息中有提取的 tag，则组合为 "tag:extractedTag"
  const finalTag = extractedTag ? `${tag}:${extractedTag}` : tag;
  const logger = getTagLogger(finalTag);

  if (type === 'stderr' && isErrorMessage(message)) {
    logger.error(cleanMessage);
    return;
  }
  // 仅当原始 tag 是 "info" 时使用 info 级别
  if (tag === 'info') {
    logger.info(cleanMessage);
    return;
  }
  logger.success(cleanMessage);
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
