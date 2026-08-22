/**
 * All mock handlers aggregated.
 */
import { authHandlers } from './auth.js';
import { integrationHandlers } from './integration.js';
import { settingsHandlers } from './settings.js';

export { authHandlers, integrationHandlers, settingsHandlers };

/** All handlers combined for convenience. */
export const allHandlers = [
  ...authHandlers,
  ...integrationHandlers,
  ...settingsHandlers,
];
