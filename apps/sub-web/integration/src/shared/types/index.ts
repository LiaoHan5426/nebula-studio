// 订阅类型
export enum SubscribeType {
  CDC = 'CDC',
  POLLING = 'POLLING',
  TRIGGER = 'TRIGGER',
}

// 订阅状态
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ERROR = 'ERROR',
}

export interface PollingConfig {
  intervalMs: number;
  lastModifiedColumn: string;
  pollingQuery?: string | null;
}

export interface CdcConfig {
  debeziumConnector: string;
  kafkaTopic: string;
  snapshotMode: string;
}

export interface SubscriptionConfig {
  dataSourceId: string;
  tableName: string;
  subscribeType: SubscribeType;
  pollingConfig?: PollingConfig;
  cdcConfig?: CdcConfig;
  columns: string[];
  eventTypes: string[];
}

export interface TableSubscription {
  subscriptionId: string;
  tenantId: string;
  dataSourceId: string;
  tableName: string;
  subscribeType: SubscribeType;
  status: SubscriptionStatus;
  createdAt: string;
  config: SubscriptionConfig;
}

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

export enum AuthType {
  NONE = 'NONE',
  API_KEY = 'API_KEY',
  OAUTH2 = 'OAUTH2',
  JWT = 'JWT',
}

export interface AuthConfig {
  authType: AuthType;
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

export enum ConnectorType {
  DATABASE = 'DATABASE',
  PROTOCOL = 'PROTOCOL',
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  driverClassName?: string;
}

export interface ProtocolConfig {
  endpointUri: string;
  parameters: Record<string, unknown>;
}

export interface ValidationResult {
  success: boolean;
  message: string;
  responseTimeMs: number;
}

export interface DatabaseConnector {
  connectorId: string;
  connectorType: ConnectorType.DATABASE;
  databaseType: string;
  jdbcUrlTemplate: string;
  status: 'ACTIVE' | 'INACTIVE';
  pluginId?: string;
  pluginName?: string;
  pluginVersion?: string;
}

export interface ProtocolConnector {
  connectorId: string;
  connectorType: ConnectorType.PROTOCOL;
  protocolType: string;
  status: 'ACTIVE' | 'INACTIVE';
  pluginId?: string;
  pluginName?: string;
  pluginVersion?: string;
}

export type Connector = DatabaseConnector | ProtocolConnector;

export interface DataSourceConfig {
  dataSourceId: string;
  name: string;
  connectorId: string;
  config: DatabaseConfig | ProtocolConfig;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export type { ApiResponse } from '@nebula-studio/api-client';
export { isApiSuccess } from '@nebula-studio/api-client';
export type {
  PageResponse,
  MybatisPage,
  PageResult,
} from '@nebula-studio/api-client';

export interface TenantContext {
  tenantId: string;
  tenantName: string;
  allowedConnectors: string[];
}

export interface LoginResult {
  token: string;
  username: string;
  userId: number;
  roles?: string[];
}

export interface AuthProfile {
  username: string;
  userId: number;
  roles: string[];
}

export interface FlowDefinition {
  id: string;
  name: string;
  category?: string;
  tenantId: string;
  status: string;
  description?: string;
  bpmnXml?: string;
  currentVersionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FlowCreateRequest {
  name: string;
  category?: string;
  tenantId: string;
  description?: string;
  bpmnXml?: string;
}

export interface SubscriptionEvent {
  id: string;
  type: string;
  timestamp: string;
  payload: unknown;
}

// ==================== Resource 模型 ====================

export enum ResourceType {
  API = 'API',
  CONNECTOR = 'CONNECTOR',
  PLUGIN = 'PLUGIN',
  FLOW = 'FLOW',
  DATASOURCE = 'DATASOURCE',
}

export enum ResourceStatus {
  DRAFT = 'DRAFT',
  VERSIONED = 'VERSIONED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
  ARCHIVED = 'ARCHIVED',
}

export interface ResourceRecord {
  id: string;
  name: string;
  description: string;
  resourceType: ResourceType | string;
  status: ResourceStatus | string;
  tenantId: string;
  ownerId: string;
  versionId: string;
  labels: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceCreateRequest {
  name: string;
  description?: string;
  resourceType: ResourceType | string;
  tenantId: string;
  labels?: string;
}

export interface ResourceUpdateRequest {
  name?: string;
  description?: string;
  status?: ResourceStatus | string;
  labels?: string;
  versionId?: string;
}

export interface ResourceQueryParams {
  tenantId: string;
  resourceType?: string;
  status?: string;
  keyword?: string;
  page?: number;
  size?: number;
}

// ==================== 发布流程模型 ====================

export enum PublishStatus {
  DRAFT = 'DRAFT',
  VERSION = 'VERSION',
  APPROVAL = 'APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DEPLOYING = 'DEPLOYING',
  DEPLOYED = 'DEPLOYED',
  ROLLED_BACK = 'ROLLED_BACK',
}

export interface GovernanceRequest {
  requestId: string;
  resourceId: string;
  resourceType: string;
  applicant: string;
  status: PublishStatus;
  submittedAt: string;
  approver?: string;
  comment?: string;
  versionSnapshot?: string;
}

export interface GovernanceApprovalRequest {
  resourceId: string;
  resourceType: string;
  description?: string;
}

export interface GovernanceApprovalDecision {
  requestId: string;
  approved: boolean;
  comment: string;
}

export interface VersionSnapshot {
  snapshotId: string;
  resourceId: string;
  version: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface ReleaseRecord {
  releaseId: string;
  requestId: string;
  resourceId: string;
  status: 'DEPLOYING' | 'DEPLOYED' | 'FAILED' | 'ROLLED_BACK';
  deployedAt?: string;
  deployedBy?: string;
}

// ==================== 治理策略模型 ====================

export enum GovernancePolicyType {
  RATE_LIMIT = 'RATE_LIMIT',
  CIRCUIT_BREAKER = 'CIRCUIT_BREAKER',
  WHITELIST = 'WHITELIST',
  BLACKLIST = 'BLACKLIST',
}

export interface GovernancePolicy {
  policyId: string;
  resourceId: string;
  policyType: GovernancePolicyType;
  config: Record<string, unknown>;
  enabled: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}
