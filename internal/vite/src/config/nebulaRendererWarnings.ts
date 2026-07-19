import type { UserConfig } from 'vite';

export type NebulaRendererOnWarn = NonNullable<
  NonNullable<NonNullable<UserConfig['build']>['rollupOptions']>['onwarn']
>;

/**
 * Ignore warnings emitted for misplaced pure annotations in third-party code.
 * Rolldown already ignores those annotations, so they do not affect output.
 */
export const handleNebulaRendererWarning: NebulaRendererOnWarn = (
  warning,
  defaultHandler,
) => {
  if (warning.code === 'INVALID_ANNOTATION') return;
  defaultHandler(warning);
};
