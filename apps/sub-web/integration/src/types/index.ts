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

// 轮询配置
export interface PollingConfig {
  intervalMs: number;
  lastModifiedColumn: string;
  pollingQuery: string;
}

// CDC 配置
export interface CdcConfig {
  debeziumConnector: string;
  kafkaTopic: string;
  snapshotMode: string;
}

// 订阅配置
export interface SubscriptionConfig {
  dataSourceId: string;
  tableName: string;
  subscribeType: SubscribeType;
  pollingConfig?: PollingConfig;
  cdcConfig?: CdcConfig;
  columns: string[];
  eventTypes: string[];
}

// 库表订阅
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

// 接口类型
export enum InterfaceType {
  ATOMIC = 'ATOMIC',
  COMPOSITE = 'COMPOSITE',
}

// 接口方法
export enum InterfaceMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

// 接口状态
export enum InterfaceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
}

// 认证类型
export enum AuthType {
  NONE = 'NONE',
  API_KEY = 'API_KEY',
  OAUTH2 = 'OAUTH2',
  JWT = 'JWT',
}

// 认证配置
export interface AuthConfig {
  authType: AuthType;
  apiKeyHeader?: string;
  oauth2ClientId?: string;
  oauth2Scope?: string;
  allowedTenants: string[];
}

// Schema 字段
export interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

// 接口 Schema
export interface InterfaceSchema {
  type: string;
  fields: Record<string, SchemaField>;
}

// 原子接口
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

// 步骤类型
export enum StepType {
  CALL = 'CALL',
  TRANSFORM = 'TRANSFORM',
  CONDITION = 'CONDITION',
  LOOP = 'LOOP',
  AGGREGATE = 'AGGREGATE',
}

// 错误处理
export interface ErrorHandling {
  onError: string;
  fallbackInterfaceId?: string;
  retryCount: number;
  retryDelayMs: number;
}

// 接口步骤
export interface InterfaceStep {
  order: number;
  interfaceId: string;
  stepType: StepType;
  inputMapping: string;
  outputMapping: string;
  errorHandling: ErrorHandling;
}

// 组合接口
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

// API 接口（联合类型）
export type ApiInterface = AtomicInterface | CompositeInterface;

// 连接器类型
export enum ConnectorType {
  DATABASE = 'DATABASE',
  PROTOCOL = 'PROTOCOL',
}

// 数据库配置
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  driverClassName: string;
}

// 协议配置
export interface ProtocolConfig {
  endpointUri: string;
  parameters: Record<string, any>;
}

// 验证结果
export interface ValidationResult {
  success: boolean;
  message: string;
  responseTimeMs: number;
}

// 数据库连接器
export interface DatabaseConnector {
  connectorId: string;
  connectorType: ConnectorType.DATABASE;
  databaseType: string;
  jdbcUrlTemplate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

// 协议连接器
export interface ProtocolConnector {
  connectorId: string;
  connectorType: ConnectorType.PROTOCOL;
  protocolType: string;
  status: 'ACTIVE' | 'INACTIVE';
}

// 连接器（联合类型）
export type Connector = DatabaseConnector | ProtocolConnector;

// 数据源配置
export interface DataSourceConfig {
  dataSourceId: string;
  name: string;
  connectorId: string;
  config: DatabaseConfig | ProtocolConfig;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

// API 响应
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// 分页响应
export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 租户上下文
export interface TenantContext {
  tenantId: string;
  tenantName: string;
  allowedConnectors: string[];
}
