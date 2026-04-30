export { createLogger, type LoggerInstance } from './logger';
export { useLogger } from './hooks/use-logger';
export {
  applyReplacementRules,
  replaceOrThrow,
  withJsonTrailingNewline,
  type TextReplacementRule,
} from './text';

export const isDevelopment = process.env.NODE_ENV === 'development';
