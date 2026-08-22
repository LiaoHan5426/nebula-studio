import type {
  GeneratedFlowCreateRequest,
  GeneratedTaskCreateRequest,
  GeneratedTaskUpdateRequest,
} from '../generated/facade.ts';
import type { FlowCreateRequest } from './flow.js';
import type { TaskCreateRequest, TaskUpdateRequest } from './task.js';

export function toGeneratedTaskCreateRequest(
  request: TaskCreateRequest,
): GeneratedTaskCreateRequest {
  return {
    taskName: request.name,
    taskType: request.taskType,
    triggerType: request.triggerType,
    cronExpression: request.cronExpression,
    taskConfig: request.payload,
    tenantId: request.metadata?.tenantId as string | undefined,
  };
}

export function toGeneratedTaskUpdateRequest(
  request: TaskUpdateRequest,
): GeneratedTaskUpdateRequest {
  return {
    cronExpression: request.cronExpression,
    taskConfig: request.payload,
  };
}

export function toGeneratedFlowCreateRequest(
  request: FlowCreateRequest,
): GeneratedFlowCreateRequest {
  return {
    bpmnXml: request.bpmnXml,
    category: request.category,
    description: request.description,
    name: request.name,
    tenantId: request.tenantId,
  };
}
