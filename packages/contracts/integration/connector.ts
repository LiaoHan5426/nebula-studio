/**
 * @nebula-studio/contracts/integration — 连接器域
 */

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
