/**
 * Stable facade over openapi-typescript output.
 *
 * Business code must import these aliases from `@nebula-studio/contracts/generated`
 * instead of coupling to generated file names.
 */
import type { components, operations, paths } from './platform-api.ts';

export type PlatformApiPaths = paths;
export type PlatformApiComponents = components;
export type PlatformApiOperations = operations;
export type PlatformApiPath = keyof PlatformApiPaths;
export type PlatformApiOperationId = keyof PlatformApiOperations;
export type PlatformApiOperation<Id extends PlatformApiOperationId> =
  PlatformApiOperations[Id];
