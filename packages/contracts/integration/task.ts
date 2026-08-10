/**
 * @nebula-studio/contracts/integration — 任务域
 */

export enum TaskType {
  CRON = 'CRON',
  EVENT = 'EVENT',
  FIXED_DELAY = 'FIXED_DELAY',
  FIXED_RATE = 'FIXED_RATE',
  MANUAL = 'MANUAL',
}

export enum TaskStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  ERROR = 'ERROR',
  PAUSED = 'PAUSED',
}

export enum TaskInstanceStatus {
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  CREATED = 'CREATED',
  FAILED = 'FAILED',
  RUNNING = 'RUNNING',
  SCHEDULED = 'SCHEDULED',
  TIMEOUT = 'TIMEOUT',
}

export interface TaskDefinition {
  createdAt?: string;
  cronExpression?: string;
  id: string;
  metadata?: Record<string, unknown>;
  name: string;
  payload?: string;
  status: TaskStatus;
  taskType: TaskType;
  tenantId?: string;
  triggerType: string;
  updatedAt?: string;
}

export interface TaskCreateRequest {
  cronExpression?: string;
  metadata?: Record<string, unknown>;
  name: string;
  payload?: string;
  taskType: TaskType;
  triggerType: string;
}

export interface TaskUpdateRequest {
  cronExpression?: string;
  metadata?: Record<string, unknown>;
  name?: string;
  payload?: string;
}

export interface TaskInstance {
  createdAt?: string;
  definitionId: string;
  finishedAt?: string;
  instanceId: string;
  maxRetries?: number;
  nodeId?: string;
  retryCount?: number;
  startedAt?: string;
  status: string | TaskInstanceStatus;
  taskName?: string;
  tenantId?: string;
}

export interface TaskLog {
  definitionId?: string;
  instanceId: string;
  level: 'DEBUG' | 'ERROR' | 'INFO' | 'WARN' | string;
  logId: string;
  message: string;
  stackTrace?: string;
  timestamp?: string;
}

export interface TaskResult {
  durationMs?: number;
  errorMessage?: string;
  errorType?: string;
  output?: string;
  retryCount?: number;
  success: boolean;
}
