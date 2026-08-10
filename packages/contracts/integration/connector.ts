/**
 * @nebula-studio/contracts/integration — 连接器域
 */

export enum ConnectorType {
  DATABASE = 'DATABASE',
  PROTOCOL = 'PROTOCOL',
}

export interface DatabaseConfig {
  database: string;
  driverClassName?: string;
  host: string;
  password: string;
  port: number;
  username: string;
}

export interface ProtocolConfig {
  endpointUri: string;
  parameters: Record<string, unknown>;
}

export interface ValidationResult {
  message: string;
  responseTimeMs: number;
  success: boolean;
}

export interface DatabaseConnector {
  connectorId: string;
  connectorType: ConnectorType.DATABASE;
  databaseType: string;
  jdbcUrlTemplate: string;
  pluginId?: string;
  pluginName?: string;
  pluginVersion?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ProtocolConnector {
  connectorId: string;
  connectorType: ConnectorType.PROTOCOL;
  pluginId?: string;
  pluginName?: string;
  pluginVersion?: string;
  protocolType: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type Connector = DatabaseConnector | ProtocolConnector;

export interface DataSourceConfig {
  config: DatabaseConfig | ProtocolConfig;
  connectorId: string;
  createdAt: string;
  dataSourceId: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}
