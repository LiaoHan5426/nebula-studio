import { createNebulaApiProxy } from '@nebula-studio-internal/vite';

/** @deprecated Prefer createNebulaApiProxy({ preset: 'integration' }) in vite.config.ts */
export const proxy = createNebulaApiProxy({ preset: 'integration' });
