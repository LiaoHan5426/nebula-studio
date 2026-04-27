import consola from 'consola';

type LoggerMethod = (...args: unknown[]) => void;
export type LoggerInstance = {
  info: LoggerMethod;
  success: LoggerMethod;
  warn: LoggerMethod;
  error: LoggerMethod;
};

function normalizeUnknown(input: unknown): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input instanceof Error) {
    return input.stack ?? `${input.name}: ${input.message}`;
  }
  if (
    typeof input === 'number' ||
    typeof input === 'boolean' ||
    input === null
  ) {
    return String(input);
  }
  if (
    typeof input === 'bigint' ||
    typeof input === 'symbol' ||
    typeof input === 'undefined'
  ) {
    return String(input);
  }

  try {
    return JSON.stringify(input);
  } catch {
    return '[Unserializable]';
  }
}

function formatMessage(fullTag: string, args: unknown[]): string {
  const body = args.map((arg) => normalizeUnknown(arg)).join(' ');
  return body.length > 0 ? `[${fullTag}] ${body}` : `[${fullTag}]`;
}

/**
 * 创建带命名空间 tag 的统一日志记录器。
 */
export function createLogger(tag: string): LoggerInstance {
  const fullTag = `nebula-studio:${tag}`;
  return {
    info: (...args) => {
      consola.info(formatMessage(fullTag, args));
    },
    success: (...args) => {
      consola.success(formatMessage(fullTag, args));
    },
    warn: (...args) => {
      consola.warn(formatMessage(fullTag, args));
    },
    error: (...args) => {
      consola.error(formatMessage(fullTag, args));
    },
  };
}
