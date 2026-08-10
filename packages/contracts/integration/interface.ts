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
  DELETE = 'DELETE',
  GET = 'GET',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
}

export enum InterfaceStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  INACTIVE = 'INACTIVE',
  PENDING_REVIEW = 'PENDING_REVIEW',
}

export enum InterfaceAuthType {
  API_KEY = 'API_KEY',
  JWT = 'JWT',
  NONE = 'NONE',
  OAUTH2 = 'OAUTH2',
}

export interface AuthConfig {
  allowedTenants: string[];
  apiKey?: string;
  apiKeyHeader?: string;
  authType: InterfaceAuthType;
  oauth2ClientId?: string;
  oauth2Scope?: string;
}

export interface SchemaField {
  description: string;
  name: string;
  required: boolean;
  type: string;
}

export interface InterfaceSchema {
  fields: Record<string, SchemaField>;
  type: string;
}

export type SubscriptionMode = 'APPROVAL' | 'OPEN';
export type OrchestrationType = 'ATOMIC' | 'BPMN' | 'DAG';

export interface InterfaceOrchestrationMeta {
  dagDefinitionId?: string;
  flowDefinitionId?: string;
  orchestrationType?: OrchestrationType;
  publishedAt?: string;
  subscriptionMode?: SubscriptionMode;
}

export interface AtomicInterface extends InterfaceOrchestrationMeta {
  authConfig: AuthConfig;
  connectorId: string;
  createdAt: string;
  createdBy?: string;
  endpointUri: string;
  interfaceId: string;
  interfaceName: string;
  interfaceType: InterfaceType.ATOMIC;
  lastModifiedAt: string;
  method: InterfaceMethod;
  requestMapping: Record<string, string>;
  requestSchema: InterfaceSchema;
  responseMapping: Record<string, string>;
  responseSchema: InterfaceSchema;
  status: InterfaceStatus;
  tenantId: string;
}

export enum StepType {
  AGGREGATE = 'AGGREGATE',
  CALL = 'CALL',
  CONDITION = 'CONDITION',
  LOOP = 'LOOP',
  TRANSFORM = 'TRANSFORM',
}

export interface ErrorHandling {
  fallbackInterfaceId?: string;
  onError: string;
  retryCount: number;
  retryDelayMs: number;
}

export interface InterfaceStep {
  errorHandling: ErrorHandling;
  inputMapping: string;
  interfaceId: string;
  order: number;
  outputMapping: string;
  stepType: StepType;
}

export interface CompositeInterface extends InterfaceOrchestrationMeta {
  authConfig: AuthConfig;
  createdAt: string;
  createdBy?: string;
  endpointUri: string;
  flowExpression: string;
  interfaceId: string;
  interfaceName: string;
  interfaceType: InterfaceType.COMPOSITE;
  lastModifiedAt: string;
  method: InterfaceMethod;
  status: InterfaceStatus;
  steps: InterfaceStep[];
  tenantId: string;
}

export interface DagDefinitionRecord {
  createdAt?: string;
  createdBy?: string;
  dagDefinition?: string;
  dagName: string;
  id: string;
  nodeConfigs?: string;
  status?: string;
  tenantId?: string;
  updatedAt?: string;
  version?: number;
}

export type ApiInterface = AtomicInterface | CompositeInterface;
