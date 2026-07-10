import { taskRequest, taskInstanceRequest } from '@/shared/api/client';
import type {
  ApiResponse,
  TaskCreateRequest,
  TaskDefinition,
  TaskInstance,
  TaskLog,
  TaskResult,
  TaskUpdateRequest,
} from '@nebula-studio/contracts/integration';

export const taskApi = {
  list(tenantId?: string): Promise<ApiResponse<TaskDefinition[]>> {
    const query = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : '';
    return taskRequest<TaskDefinition[]>(query);
  },

  get(id: string): Promise<ApiResponse<TaskDefinition>> {
    return taskRequest<TaskDefinition>(`/${id}`);
  },

  create(body: TaskCreateRequest): Promise<ApiResponse<TaskDefinition>> {
    return taskRequest<TaskDefinition>('', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update(
    id: string,
    body: TaskUpdateRequest,
  ): Promise<ApiResponse<TaskDefinition>> {
    return taskRequest<TaskDefinition>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(id: string): Promise<ApiResponse<void>> {
    return taskRequest<void>(`/${id}`, { method: 'DELETE' });
  },

  changeStatus(id: string, status: string): Promise<ApiResponse<void>> {
    return taskRequest<void>(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  trigger(id: string): Promise<ApiResponse<void>> {
    return taskRequest<void>(`/${id}/trigger`, { method: 'POST' });
  },

  getByType(taskType: string): Promise<ApiResponse<TaskDefinition[]>> {
    return taskRequest<TaskDefinition[]>(
      `/by-type?taskType=${encodeURIComponent(taskType)}`,
    );
  },

  getByTriggerType(
    triggerType: string,
  ): Promise<ApiResponse<TaskDefinition[]>> {
    return taskRequest<TaskDefinition[]>(
      `/by-trigger?triggerType=${encodeURIComponent(triggerType)}`,
    );
  },

  listInstances(
    definitionId?: string,
    tenantId?: string,
  ): Promise<ApiResponse<TaskInstance[]>> {
    const params = new URLSearchParams();
    if (definitionId) params.set('definitionId', definitionId);
    if (tenantId) params.set('tenantId', tenantId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return taskInstanceRequest<TaskInstance[]>(query);
  },

  getInstance(instanceId: string): Promise<ApiResponse<TaskInstance>> {
    return taskInstanceRequest<TaskInstance>(`/${instanceId}`);
  },

  getInstanceLogs(instanceId: string): Promise<ApiResponse<TaskLog[]>> {
    return taskInstanceRequest<TaskLog[]>(`/${instanceId}/logs`);
  },

  retryInstance(instanceId: string): Promise<ApiResponse<TaskResult>> {
    return taskInstanceRequest<TaskResult>(`/${instanceId}/retry`, {
      method: 'POST',
    });
  },
};
