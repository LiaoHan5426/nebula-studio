import { taskRequest } from '@/shared/api/client';
import type {
  ApiResponse,
  TaskCreateRequest,
  TaskDefinition,
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
};
