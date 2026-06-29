/**
 * @nebula-studio/contracts/integration — 任务域
 */

export enum TaskType {
  CRON = 'CRON',
  FIXED_DELAY = 'FIXED_DELAY',
  FIXED_RATE = 'FIXED_RATE',
  EVENT = 'EVENT',
  MANUAL = 'MANUAL',
}

export enum TaskStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
}

export interface TaskDefinition {
  id: string;
  name: string;
  taskType: TaskType;
  status: TaskStatus;
  cronExpression?: string;
  payload?: string;
  triggerType: string;
  tenantId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskCreateRequest {
  name: string;
  taskType: TaskType;
  cronExpression?: string;
  payload?: string;
  triggerType: string;
  metadata?: Record<string, unknown>;
}

export interface TaskUpdateRequest {
  name?: string;
  cronExpression?: string;
  payload?: string;
  metadata?: Record<string, unknown>;
}
