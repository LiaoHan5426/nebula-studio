import { expect } from 'vite-plus/test';
import { createLogger } from '../src/index.ts';

it('createLogger returns all expected methods', () => {
  const logger = createLogger('test');
  expect(typeof logger.info).toBe('function');
  expect(typeof logger.success).toBe('function');
  expect(typeof logger.warn).toBe('function');
  expect(typeof logger.error).toBe('function');
});
