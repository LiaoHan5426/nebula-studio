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

type Schemas = PlatformApiComponents['schemas'];

/** Stable schema aliases — business code imports these, not raw generated names. */
export type GeneratedConfigItem = Schemas['ConfigItem'];
export type GeneratedFlowCreateRequest = Schemas['FlowCreateRequest'];
export type GeneratedFlowUpdateRequest = Schemas['FlowUpdateRequest'];
export type GeneratedOrganization = Schemas['Organization'];
export type GeneratedPermission = Schemas['Permission'];
export type GeneratedRole = Schemas['Role'];
export type GeneratedShellApp = Schemas['ShellApp'];
export type GeneratedTaskCreateRequest = Schemas['TaskCreateRequest'];
export type GeneratedTaskUpdateRequest = Schemas['TaskUpdateRequest'];
export type GeneratedUser = Schemas['User'];
export type GeneratedFrontendRuntimeEntryView =
  Schemas['FrontendRuntimeEntryView'];
export type GeneratedFrontendApplicationView =
  Schemas['FrontendApplicationView'];
export type GeneratedFrontendApplicationVersionView =
  Schemas['FrontendApplicationVersionView'];
export type GeneratedFrontendApplicationCreateRequest =
  Schemas['FrontendApplicationCreateRequest'];
