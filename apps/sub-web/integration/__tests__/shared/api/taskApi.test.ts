import { beforeEach, describe, expect, it, vi } from 'vitest';

import { taskApi } from '@/shared/api/taskApi';
import { TaskType } from '@nebula-studio/contracts/integration';

const { taskRequest } = vi.hoisted(() => ({
  taskRequest: vi.fn(),
}));

vi.mock('@/shared/api/client', () => ({
  taskRequest,
  TASK_BASE: '/api/task',
}));

describe('taskApi', () => {
  beforeEach(() => {
    taskRequest.mockReset();
    taskRequest.mockResolvedValue({
      code: 0,
      isSuccess: true,
      data: [],
    });
  });

  it('lists tasks with tenantId query', async () => {
    await taskApi.list('tenant-1');
    expect(taskRequest).toHaveBeenCalledWith('?tenantId=tenant-1');
  });

  it('lists tasks without tenantId', async () => {
    await taskApi.list();
    expect(taskRequest).toHaveBeenCalledWith('');
  });

  it('gets a single task by id', async () => {
    await taskApi.get('task-1');
    expect(taskRequest).toHaveBeenCalledWith('/task-1');
  });

  it('creates a task', async () => {
    const body = {
      name: 'Test Task',
      taskType: TaskType.CRON,
      cronExpression: '0 * * * *',
      triggerType: 'CRON',
    };
    await taskApi.create(body);
    expect(taskRequest).toHaveBeenCalledWith('', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  });

  it('updates a task', async () => {
    const body = { name: 'Updated' };
    await taskApi.update('task-1', body);
    expect(taskRequest).toHaveBeenCalledWith('/task-1', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  });

  it('deletes a task', async () => {
    await taskApi.delete('task-1');
    expect(taskRequest).toHaveBeenCalledWith('/task-1', {
      method: 'DELETE',
    });
  });

  it('changes task status', async () => {
    await taskApi.changeStatus('task-1', 'ACTIVE');
    expect(taskRequest).toHaveBeenCalledWith('/task-1/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACTIVE' }),
    });
  });

  it('triggers a task', async () => {
    await taskApi.trigger('task-1');
    expect(taskRequest).toHaveBeenCalledWith('/task-1/trigger', {
      method: 'POST',
    });
  });

  it('queries by type', async () => {
    await taskApi.getByType('CRON');
    expect(taskRequest).toHaveBeenCalledWith('/by-type?taskType=CRON');
  });

  it('queries by trigger type', async () => {
    await taskApi.getByTriggerType('MANUAL');
    expect(taskRequest).toHaveBeenCalledWith('/by-trigger?triggerType=MANUAL');
  });
});
