import type { UserConfig } from 'vite';

import { nebulaRendererChunkFileNames } from './nebulaRendererOutputNames.ts';

export const NEBULA_RENDERER_CHUNK_SIZE_WARNING_LIMIT_KB = 2048;

export type NebulaRendererRolldownOptions = NonNullable<
  NonNullable<UserConfig['build']>['rolldownOptions']
>;

export type NebulaRendererOnLog = NonNullable<
  NebulaRendererRolldownOptions['onLog']
>;

/**
 * Ignore warnings emitted for misplaced pure annotations in third-party code.
 * Rolldown already ignores those annotations, so they do not affect output.
 */
export const handleNebulaRendererLog: NebulaRendererOnLog = (
  level,
  log,
  defaultHandler,
) => {
  if (log.code === 'INVALID_ANNOTATION') return;
  defaultHandler(level, log);
};

/**
 * Module Federation plugins issue thousands of `resolveId`/`load` calls per
 * Remote. Rolldown's default `pluginTimings` treats that as a warning once
 * the build exceeds ~3s, which is expected here rather than a regression.
 */
export const nebulaRendererRolldownOptions: NebulaRendererRolldownOptions = {
  onLog: handleNebulaRendererLog,
  checks: {
    pluginTimings: false,
  },
  output: {
    chunkFileNames: nebulaRendererChunkFileNames,
  },
};
