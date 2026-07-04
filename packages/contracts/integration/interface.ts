/**
 * @nebula-studio/contracts/integration — 接口域
 *
 * 注意：`AuthType` 已重命名为 `InterfaceAuthType`，避免与 OAuth/security 概念混淆。
 */

export enum InterfaceType {
  ATOMIC = 'ATOMIC',
  COMPOSITE = 'COMPOSITE',
}

export enum InterfaceMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export enum InterfaceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
}

export enum InterfaceAuthType {
  NONE = 'NONE',
  API_KEY = 'API_KEY',
  OAUTH2 = 'OAUTH2',
  JWT = 'JWT',
}

export interface AuthConfig {
  authType: InterfaceAuthType;
  apiKeyHeader?: string;
  apiKey?: string;
  oauth2ClientId?: string;
  oauth2Scope?: string;
  allowedTenants: string[];
}

export interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface InterfaceSchema {
  type: string;
  fields: Record<string, SchemaField>;
}

export type SubscriptionMode = 'OPEN' | 'APPROVAL';
export type OrchestrationType = 'ATOMIC' | 'BPMN' | 'DAG';

export interface InterfaceOrchestrationMeta {
  subscriptionMode?: SubscriptionMode;
  orchestrationType?: OrchestrationType;
  flowDefinitionId?: string;
  dagDefinitionId?: string;
  publishedAt?: string;
}

export interface AtomicInterface extends InterfaceOrchestrationMeta {
  interfaceId: string;
  tenantId: string;
  createdBy?: string;
  interfaceName: string;
  interfaceType: InterfaceType.ATOMIC;
  endpointUri: string;
  method: InterfaceMethod;
  authConfig: AuthConfig;
  status: InterfaceStatus;
  createdAt: string;
  lastModifiedAt: string;
  connectorId: string;
  requestMapping: Record<string, string>;
  responseMapping: Record<string, string>;
  requestSchema: InterfaceSchema;
  responseSchema: InterfaceSchema;
}

export enum StepType {
  CALL = 'CALL',
  TRANSFORM = 'TRANSFORM',
  CONDITION = 'CONDITION',
  LOOP = 'LOOP',
  AGGREGATE = 'AGGREGATE',
}

export interface ErrorHandling {
  onError: string;
  fallbackInterfaceId?: string;
  retryCount: number;
  retryDelayMs: number;
}

export interface InterfaceStep {
  order: number;
  interfaceId: string;
  stepType: StepType;
  inputMapping: string;
  outputMapping: string;
  errorHandling: ErrorHandling;
}

export interface CompositeInterface extends InterfaceOrchestrationMeta {
  interfaceId: string;
  tenantId: string;
  createdBy?: string;
  interfaceName: string;
  interfaceType: InterfaceType.COMPOSITE;
  endpointUri: string;
  method: InterfaceMethod;
  authConfig: AuthConfig;
  status: InterfaceStatus;
  createdAt: string;
  lastModifiedAt: string;
  steps: InterfaceStep[];
  flowExpression: string;
}

export interface DagDefinitionRecord {
  id: string;
  dagName: string;
  tenantId?: string;
  version?: number;
  status?: string;
  createdBy?: string;
  dagDefinition?: string;
  nodeConfigs?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ApiInterface = AtomicInterface | CompositeInterface;
