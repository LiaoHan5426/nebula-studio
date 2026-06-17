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

export interface AtomicInterface {
  interfaceId: string;
  tenantId: string;
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

export interface CompositeInterface {
  interfaceId: string;
  tenantId: string;
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
}

export interface ProtocolConnector {
  connectorId: string;
  connectorType: ConnectorType.PROTOCOL;
  protocolType: string;
  status: 'ACTIVE' | 'INACTIVE';
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

/** nebula-core ApiResponse with legacy `success` compat */
export interface ApiResponse<T = unknown> {
  code?: number;
  isSuccess?: boolean;
  /** @deprecated use isSuccess */
  success?: boolean;
  data: T;
  message?: string;
  error?: string;
}

export function isApiSuccess<T>(response: ApiResponse<T>): boolean {
  if (typeof response.isSuccess === 'boolean') return response.isSuccess;
  if (typeof response.success === 'boolean') return response.success;
  return response.code === 200;
}

export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MybatisPage<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface TenantContext {
  tenantId: string;
  tenantName: string;
  allowedConnectors: string[];
}

export interface LoginResult {
  token: string;
  username: string;
  userId: number;
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
