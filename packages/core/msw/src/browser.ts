/**
 * MSW browser setup for development mock.
 */
import { setupWorker } from 'msw/browser';
import { allHandlers } from './handlers/index.js';

export const worker = setupWorker(...allHandlers);
